import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import { apiBaseUrl } from '../services/api';
import { apiRoutes, paginationConstants } from '../constants/api.constants';
import { routePaths } from '../constants/routes.constants';
import { missingStatus } from '../constants/filter.constants';
import {
  MAP_NIGHT_STYLE,
  HEATMAP_GRADIENT,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  millisecondsPerDay,
  heatmapRadius,
  heatmapOpacity,
  highRiskThreshold,
  minNearbyCasesForHighRiskZone,
  markerCaseColor,
  markerStrokeColor,
  markerUserColor,
  markerCaseScale,
  markerUserScale,
  markerStrokeWeight,
  markerUserStrokeWeight,
  userLocationZoom,
  caseDetailZoom,
  userLocationRadius,
} from '../constants/map.constants';
import type { MissingPerson } from '../types';
import { formatDate as formatDateUtil } from '../utils';
import { useGoogleMaps } from './useGoogleMaps';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export type TimeFilter = 'all' | '24h' | '7d' | '30d';

/**
 * Composable for the risk map view: loads missing persons, renders markers and heatmap,
 * supports time filtering, and provides centering/pan utilities.
 */
export function useRiskMap() {
  const isLoading = ref(true);
  const errorMessage = ref('');
  const activeCasesCount = ref(0);
  const highRiskZonesCount = ref(0);
  const timeFilter = ref<TimeFilter>('all');
  const mapClickCoords = ref<{ lat: number; lng: number } | null>(null);

  let infoWindow: google.maps.InfoWindow | null = null;
  let mapInstance: google.maps.Map | null = null;
  let markers: google.maps.Marker[] = [];
  let heatmapLayer: google.maps.visualization.HeatmapLayer | null = null;
  let allCasesWithCoords: MissingPerson[] = [];

  const { t, locale } = useI18n();
  const { loadScript } = useGoogleMaps();

  const fetchMissingPersons = async (): Promise<MissingPerson[]> => {
    const response = await api.get(apiRoutes.missingPersons, {
      params: {
        factor: paginationConstants.mapPageSize,
        status: missingStatus,
      },
    });
    const allCases: MissingPerson[] = response.data.items;
    const activeCases = allCases.filter((person) => person.status === missingStatus);
    activeCasesCount.value = activeCases.length;
    return activeCases.filter(
      (person) =>
        person.coordinates?.coordinates &&
        person.coordinates.coordinates.length === 2
    );
  };

  const filterByTime = (cases: MissingPerson[]): MissingPerson[] => {
    if (timeFilter.value === 'all') return cases;

    const now = Date.now();
    const thresholds: Record<TimeFilter, number> = {
      'all': Infinity,
      '24h': millisecondsPerDay,
      '7d': millisecondsPerDay * 7,
      '30d': millisecondsPerDay * 30,
    };

    const threshold = thresholds[timeFilter.value];
    return cases.filter((person) => {
      const lastSeen = new Date(person.lastSeenDate).getTime();
      return now - lastSeen <= threshold;
    });
  };

  const clearMarkers = (): void => {
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
  };

  const updateMapData = (): void => {
    if (!mapInstance) return;

    const filteredCases = filterByTime(allCasesWithCoords);

    clearMarkers();

    if (heatmapLayer) {
      heatmapLayer.setMap(null);
    }

    if (filteredCases.length > 0) {
      const heatmapData = filteredCases.map((person) => {
        const [lng, lat] = person.coordinates!.coordinates;
        return new google.maps.LatLng(lat, lng);
      });

      heatmapLayer = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapInstance,
        gradient: HEATMAP_GRADIENT,
        radius: heatmapRadius,
        opacity: heatmapOpacity,
      });

      filteredCases.forEach((person) => {
        const [lng, lat] = person.coordinates!.coordinates;
        addMarker(mapInstance!, { lat, lng }, person);
      });

      highRiskZonesCount.value = calculateHighRiskZones(filteredCases);
    } else {
      highRiskZonesCount.value = 0;
    }
  };

  const setTimeFilter = (filter: TimeFilter): void => {
    timeFilter.value = filter;
    updateMapData();
  };

  /**
   * Counts distinct high-risk zones where at least minNearbyCasesForHighRiskZone
   * cases are within highRiskThreshold distance of each other.
   */
  const calculateHighRiskZones = (cases: MissingPerson[]): number => {
    const zones = new Set<string>();

    cases.forEach((caseA, i) => {
      let nearbyCount = 0;
      cases.forEach((caseB, j) => {
        if (i !== j && caseA.coordinates && caseB.coordinates) {
          const [lngA, latA] = caseA.coordinates.coordinates;
          const [lngB, latB] = caseB.coordinates.coordinates;
          const distance = Math.sqrt(
            Math.pow(latA - latB, 2) + Math.pow(lngA - lngB, 2)
          );
          if (distance < highRiskThreshold) nearbyCount++;
        }
      });
      if (nearbyCount >= minNearbyCasesForHighRiskZone && caseA.coordinates) {
        const [lng, lat] = caseA.coordinates.coordinates;
        zones.add(`${Math.round(lat * 10)}-${Math.round(lng * 10)}`);
      }
    });

    return zones.size;
  };

  const formatDate = (dateString: string): string =>
    formatDateUtil(dateString, locale.value, 'short');

  /** Builds HTML content for the Google Maps info window popup of a missing person. */
  const createInfoWindowContent = (person: MissingPerson): string => {
    const rawPhoto = person.photos?.[0] || '';
    const photo = rawPhoto.startsWith('/') ? `${apiBaseUrl}${rawPhoto}` : rawPhoto;
    const noPhotoLabel = t('riskMap.noPhoto');
    const photoHtml = photo
      ? `<img src="${photo}" alt="${person.name}" style="width:100%;height:100px;object-fit:cover;" />`
      : `<div style="width:100%;height:60px;background:rgba(55,65,81,0.5);display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">${noPhotoLabel}</div>`;

    const personDetailUrl = `${window.location.origin}${routePaths.missingPersonDetail(person._id)}`;
    const shareLabel = t('share.title');

    return `
      <div style="font-family:system-ui;width:200px;background:rgba(0,0,0,0.8);backdrop-filter:blur(16px);border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);box-shadow:0 20px 40px rgba(0,0,0,0.6);">
        ${photoHtml}
        <div style="padding:10px;">
          <h3 style="margin:0 0 2px;font-size:14px;font-weight:700;color:#fff;">${person.name}</h3>
          <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;">${t('riskMap.ageAndGender', { age: person.age, gender: person.gender })}</p>
          <div style="font-size:10px;color:#6b7280;margin-bottom:8px;">
            <div style="margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 ${person.lastSeenLocation}</div>
            <div>📅 ${formatDate(person.lastSeenDate)}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <a href="${personDetailUrl}" style="flex:1;text-align:center;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:6px;border-radius:6px;text-decoration:none;font-size:10px;font-weight:600;">
              ${t('riskMap.viewCase')}
            </a>
            <a href="#" data-share-person-id="${person._id}" role="button" aria-label="${shareLabel}" style="display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.15);color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  };

  const addMarker = (
    map: google.maps.Map,
    position: { lat: number; lng: number },
    person: MissingPerson
  ) => {
    const marker = new google.maps.Marker({
      position,
      map,
      title: person.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: markerCaseScale,
        fillColor: markerCaseColor,
        fillOpacity: 1,
        strokeColor: markerStrokeColor,
        strokeWeight: markerStrokeWeight,
      },
      animation: google.maps.Animation.DROP,
    });

    marker.addListener('click', () => {
      if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow();
      }
      infoWindow.setContent(createInfoWindowContent(person));
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  };

  /** Loads Google Maps script, fetches missing persons, and initializes the map in the given container. */
  const initializeMap = async (container: HTMLElement): Promise<void> => {
    if (!googleMapsApiKey) {
      errorMessage.value = t('errors.mapsApiKey');
      isLoading.value = false;
      return;
    }

    try {
      const [, casesWithCoords] = await Promise.all([
        loadScript(googleMapsApiKey),
        fetchMissingPersons(),
      ]);

      allCasesWithCoords = casesWithCoords;

      const map = new google.maps.Map(container, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        styles: MAP_NIGHT_STYLE,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
      });

      mapInstance = map;

      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          mapClickCoords.value = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
        }
      });

      updateMapData();
      isLoading.value = false;
    } catch (error) {
      console.error('Error loading map:', error);
      errorMessage.value = t('riskMap.loadError');
      isLoading.value = false;
    }
  };

  const centerOnUserLocation = (lat: number, lng: number): void => {
    if (!mapInstance) return;

    const position = { lat, lng };
    mapInstance.panTo(position);
    mapInstance.setZoom(userLocationZoom);

    new google.maps.Marker({
      position,
      map: mapInstance,
      title: t('riskMap.myLocation'),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: markerUserScale,
        fillColor: markerUserColor,
        fillOpacity: 1,
        strokeColor: markerStrokeColor,
        strokeWeight: markerUserStrokeWeight,
      },
      animation: google.maps.Animation.DROP,
    });

    new google.maps.Circle({
      map: mapInstance,
      center: position,
      radius: userLocationRadius,
      fillColor: markerUserColor,
      fillOpacity: 0.1,
      strokeColor: markerUserColor,
      strokeWeight: 1,
    });
  };

  const getFilteredCases = (): MissingPerson[] => {
    return filterByTime(allCasesWithCoords);
  };

  /** Pans and zooms the map to the given person's coordinates and opens their info window. */
  const panToCase = (person: MissingPerson): void => {
    if (!mapInstance || !person.coordinates) return;

    const [lng, lat] = person.coordinates.coordinates;
    mapInstance.panTo({ lat, lng });
    mapInstance.setZoom(caseDetailZoom);

    const marker = markers.find((markerItem) => markerItem.getTitle() === person.name);
    if (marker && infoWindow) {
      infoWindow.setContent(createInfoWindowContent(person));
      infoWindow.open(mapInstance, marker);
    }
  };

  return {
    isLoading,
    errorMessage,
    activeCasesCount,
    highRiskZonesCount,
    timeFilter,
    mapClickCoords,
    initializeMap,
    centerOnUserLocation,
    setTimeFilter,
    closeReportModal: () => { mapClickCoords.value = null; },
    getFilteredCases,
    panToCase,
  };
}
