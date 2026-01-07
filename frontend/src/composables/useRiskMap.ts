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

export function useRiskMap() {
  const isLoading = ref(true);
  const errorMessage = ref('');
  const activeCasesCount = ref(0);
  const highRiskZonesCount = ref(0);

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

  const addMarker = (
    map: google.maps.Map,
    position: { lat: number; lng: number },
    title: string
  ) => {
    new google.maps.Marker({
      position,
      map,
      title,
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

      const map = new google.maps.Map(container, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        styles: MAP_NIGHT_STYLE,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
      });

      if (casesWithCoords.length > 0) {
        const heatMapData = casesWithCoords.map((person) => {
          const [lng, lat] = person.coordinates!.coordinates;
          return new google.maps.LatLng(lat, lng);
        });

        new google.maps.visualization.HeatmapLayer({
          data: heatMapData,
          map,
          gradient: HEATMAP_GRADIENT,
          radius: 30,
          opacity: 0.8,
        });

        casesWithCoords.forEach((person) => {
          const [lng, lat] = person.coordinates!.coordinates;
          addMarker(map, { lat, lng }, person.name);
        });

        highRiskZonesCount.value = calculateHighRiskZones(casesWithCoords);
      }

      isLoading.value = false;
    } catch (error) {
      console.error('Error loading map:', error);
      errorMessage.value = 'Error cargando el mapa de calor.';
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    errorMessage,
    activeCasesCount,
    highRiskZonesCount,
    initializeMap,
  };
}
