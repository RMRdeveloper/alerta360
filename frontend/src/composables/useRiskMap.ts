import { ref } from 'vue';
import api from '../services/api';
import type { MissingPerson } from '../types';
import { useGoogleMaps } from './useGoogleMaps';
import {
  MAP_NIGHT_STYLE,
  HEATMAP_GRADIENT,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from '../constants/map.constants';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const HIGH_RISK_THRESHOLD = 0.05;

export type TimeFilter = 'all' | '24h' | '7d' | '30d';

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

  const { loadScript } = useGoogleMaps();

  const fetchMissingPersons = async (): Promise<MissingPerson[]> => {
    const response = await api.get('/missing-persons');
    const allCases: MissingPerson[] = response.data;
    const activeCases = allCases.filter((person) => person.status === 'missing');
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
    const msInDay = 86400000;
    const thresholds: Record<TimeFilter, number> = {
      'all': Infinity,
      '24h': msInDay,
      '7d': msInDay * 7,
      '30d': msInDay * 30,
    };

    const threshold = thresholds[timeFilter.value];
    return cases.filter((person) => {
      const lastSeen = new Date(person.lastSeenDate).getTime();
      return now - lastSeen <= threshold;
    });
  };

  const clearMarkers = (): void => {
    markers.forEach((m) => m.setMap(null));
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
      const heatMapData = filteredCases.map((person) => {
        const [lng, lat] = person.coordinates!.coordinates;
        return new google.maps.LatLng(lat, lng);
      });

      heatmapLayer = new google.maps.visualization.HeatmapLayer({
        data: heatMapData,
        map: mapInstance,
        gradient: HEATMAP_GRADIENT,
        radius: 30,
        opacity: 0.8,
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
          if (distance < HIGH_RISK_THRESHOLD) nearbyCount++;
        }
      });
      if (nearbyCount >= 2 && caseA.coordinates) {
        const [lng, lat] = caseA.coordinates.coordinates;
        zones.add(`${Math.round(lat * 10)}-${Math.round(lng * 10)}`);
      }
    });

    return zones.size;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const createInfoWindowContent = (person: MissingPerson): string => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const rawPhoto = person.photos?.[0] || '';
    const photo = rawPhoto.startsWith('/') ? `${apiBaseUrl}${rawPhoto}` : rawPhoto;
    const photoHtml = photo
      ? `<img src="${photo}" alt="${person.name}" style="width:100%;height:100px;object-fit:cover;" />`
      : `<div style="width:100%;height:60px;background:rgba(55,65,81,0.5);display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">Sin foto</div>`;

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
          <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;">${person.age} años • ${person.gender}</p>
          <div style="font-size:10px;color:#6b7280;margin-bottom:8px;">
            <div style="margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 ${person.lastSeenLocation}</div>
            <div>📅 ${formatDate(person.lastSeenDate)}</div>
          </div>
          <a href="/missing-persons/${person._id}" style="display:block;text-align:center;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:6px;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600;">
            Ver caso completo
          </a>
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
        scale: 10,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
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
  };

  const initializeMap = async (container: HTMLElement): Promise<void> => {
    if (!GOOGLE_MAPS_API_KEY) {
      errorMessage.value = 'Falta la API Key de Google Maps';
      isLoading.value = false;
      return;
    }

    try {
      const [, casesWithCoords] = await Promise.all([
        loadScript(GOOGLE_MAPS_API_KEY),
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
      errorMessage.value = 'Error cargando el mapa de calor.';
      isLoading.value = false;
    }
  };

  const centerOnUserLocation = (lat: number, lng: number): void => {
    if (!mapInstance) return;

    const position = { lat, lng };
    mapInstance.panTo(position);
    mapInstance.setZoom(14);

    new google.maps.Marker({
      position,
      map: mapInstance,
      title: 'Tu ubicación',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
      animation: google.maps.Animation.DROP,
    });

    new google.maps.Circle({
      map: mapInstance,
      center: position,
      radius: 5000,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      strokeColor: '#3B82F6',
      strokeWeight: 1,
    });
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
  };
}
