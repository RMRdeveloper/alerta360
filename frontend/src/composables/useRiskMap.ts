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
import { whatsappShareBaseUrl, whatsappColor } from '../constants/share.constants';
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
    const shareMessage = t('riskMap.shareMessage', {
      name: person.name,
      age: person.age,
      years: t('riskMap.years'),
      location: person.lastSeenLocation,
      contactPrompt: t('riskMap.contactPrompt'),
    });
    const shareText = encodeURIComponent(`🔴 ${shareMessage}\n${personDetailUrl}`);
    const whatsappUrl = `${whatsappShareBaseUrl}${shareText}`;

    return `
      <style>
        .gm-style-iw-c { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
        .gm-style-iw-d { overflow: visible !important; }
        .gm-style-iw-tc { display: none !important; }
        .gm-ui-hover-effect { top: 4px !important; right: 4px !important; }
        .gm-ui-hover-effect > span { background-color: #fff !important; }
      </style>
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
            <a href="${whatsappUrl}" target="_blank" style="display:flex;align-items:center;justify-content:center;background:${whatsappColor};color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
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
