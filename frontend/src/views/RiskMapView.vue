<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

import { useI18n } from 'vue-i18n';
import api from '../services/api';
import type { MissingPerson } from '../types';

const { t } = useI18n();

// ...
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const heatmapLayer = ref<google.maps.visualization.HeatmapLayer | null>(null);
const loading = ref(true);
const error = ref('');
const people = ref<MissingPerson[]>([]);
const heatmapThreshold = ref(1); // Default average threshold

// Placeholder for API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Watch for threshold changes to update heatmap
watch(heatmapThreshold, (newVal) => {
  if (heatmapLayer.value) {
    heatmapLayer.value.set('maxIntensity', newVal);
  }
});

const fetchPeople = async () => {
  try {
    const response = await api.get('/missing-persons');
    people.value = response.data.filter((p: MissingPerson) => 
      p.coordinates && 
      p.coordinates.coordinates && 
      p.coordinates.coordinates.length === 2
    );
  } catch (err) {
    console.error('Error fetching missing persons:', err);
    error.value = t('errors.loadData');
  }
};

const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    initMap();
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    error.value = t('errors.mapsApiKey');
    loading.value = false;
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`;
  script.async = true;
  script.defer = true;
  script.onload = () => initMap();
  script.onerror = () => {
    error.value = t('errors.mapsScript');
    loading.value = false;
  };
  document.head.appendChild(script);
};



const initMap = async () => {
  if (!mapContainer.value) return;

  await fetchPeople();

  const defaultLocation = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires default

  map.value = new google.maps.Map(mapContainer.value, {
    center: defaultLocation,
    zoom: 12,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ],
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  // Fit bounds if we have people
  if (people.value.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    
    // Clustering Logic for Tooltips
    const clusters: { lat: number, lng: number, count: number }[] = [];
    const CLUSTER_RADIUS = 0.001; // Approx 100m

    people.value.forEach(person => {
      if (!person.coordinates) return;
      const [lng, lat] = person.coordinates.coordinates;
      
      // Find existing cluster
      const existingCluster = clusters.find(c => {
        const dLat = Math.abs(c.lat - lat);
        const dLng = Math.abs(c.lng - lng);
        return dLat < CLUSTER_RADIUS && dLng < CLUSTER_RADIUS;
      });

      if (existingCluster) {
        existingCluster.count++;
      } else {
        clusters.push({ lat, lng, count: 1 });
      }

      bounds.extend({ lat, lng });
    });

    map.value.fitBounds(bounds);

    // Render Clusters as Invisible Circles
    clusters.forEach(cluster => {
      const position = { lat: cluster.lat, lng: cluster.lng };

      const circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0,
        map: map.value,
        center: position,
        radius: 300, // Larger radius for easier hovering
        zIndex: 999
      });

      const infoWindowContent = `
        <div class="p-3 min-w-[150px] text-center">
          <h3 class="font-bold text-red-600 mb-1">${t('riskMap.highRiskZone')}</h3>
          <p class="text-secondary font-bold text-lg">
            ${t('riskMap.casesNearby', { count: cluster.count })}
          </p>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        disableAutoPan: true,
      });

      circle.addListener('mouseover', () => {
        infoWindow.setPosition(position);
        infoWindow.open(map.value);
      });

      circle.addListener('mouseout', () => {
        infoWindow.close();
      });
    });

    // Add Heatmap Layer for "Red Glow" effect
    const heatmapData = people.value
      .filter(p => p.coordinates)
      .map(p => {
        const [lng, lat] = p.coordinates!.coordinates;
        return new google.maps.LatLng(lat, lng);
      });

    heatmapLayer.value = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map.value,
      radius: 50,
      opacity: 0.6,
      maxIntensity: heatmapThreshold.value,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)' // Red at highest intensity
      ]
    });
  }

  loading.value = false;
};

onMounted(() => {
  loadGoogleMaps();
});
</script>

<template>
  <div class="space-y-6 h-[calc(100vh-140px)] flex flex-col">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-secondary">{{ $t('nav.riskMap') }}</h1>
        <p class="text-light mt-1">{{ $t('riskMap.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="bg-surface px-4 py-2 rounded-xl shadow-sm border border-border flex items-center gap-3">
          <span class="text-sm font-medium text-secondary">{{ $t('riskMap.sensitivity') }}:</span>
          <input 
            type="range" 
            min="1" 
            max="20" 
            v-model.number="heatmapThreshold" 
            class="w-32 accent-primary cursor-pointer"
          />
          <span class="font-bold text-primary w-6 text-center">{{ heatmapThreshold }}</span>
        </div>
        <div class="bg-surface px-4 py-2 rounded-xl shadow-sm border border-border">
          <span class="font-bold text-primary">{{ people.length }}</span>
          <span class="text-secondary text-sm ml-1">{{ $t('riskMap.activeLocations') }}</span>
        </div>
      </div>
    </div>
    
    <div class="relative flex-1 bg-surface rounded-3xl overflow-hidden shadow-xl shadow-gray-100 border border-white">
      <div ref="mapContainer" class="w-full h-full bg-gray-100"></div>
      
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
        <div class="flex flex-col items-center gap-3">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <p class="text-secondary font-medium">{{ $t('riskMap.loading') }}</p>
        </div>
      </div>

      <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
        <div class="text-center p-6 max-w-md">
          <div class="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold text-secondary mb-2">{{ $t('riskMap.error') }}</h3>
          <p class="text-light">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
