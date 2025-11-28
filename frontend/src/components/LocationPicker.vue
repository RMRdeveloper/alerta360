<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['update:location', 'update:coordinates']);

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const marker = ref<google.maps.Marker | null>(null);
const address = ref('');
const loading = ref(false);
const error = ref('');

// Placeholder for API Key - User needs to replace this
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    initMap();
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    error.value = t('errors.mapsApiKey');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => initMap();
  script.onerror = () => {
    error.value = t('errors.mapsScript');
  };
  document.head.appendChild(script);
};

const initMap = () => {
  if (!mapContainer.value) return;

  const defaultLocation = { lat: -34.6037, lng: -58.3816 }; // Default to Buenos Aires or generic
  
  map.value = new google.maps.Map(mapContainer.value, {
    center: defaultLocation,
    zoom: 13,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  });

  // Try to auto-center on user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.value?.setCenter(pos);
      },
      () => {
        // Silently fail and keep default location if denied/error
        console.log(t('errors.geoDenied'));
      }
    );
  }

  map.value.addListener('click', (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      placeMarker(e.latLng);
      geocodePosition(e.latLng);
    }
  });
};

const placeMarker = (location: google.maps.LatLng) => {
  if (marker.value) {
    marker.value.setPosition(location);
  } else {
    marker.value = new google.maps.Marker({
      position: location,
      map: map.value,
      animation: google.maps.Animation.DROP
    });
  }
  
  const coords = {
    lat: location.lat(),
    lng: location.lng()
  };
  
  emit('update:coordinates', { type: 'Point', coordinates: [coords.lng, coords.lat] });
};

const geocodePosition = (pos: google.maps.LatLng) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: pos }, (results, status) => {
    if (status === 'OK' && results && results[0]) {
      address.value = results[0].formatted_address;
      emit('update:location', address.value);
    } else {
      address.value = t('location.unknown');
      emit('update:location', `${pos.lat().toFixed(6)}, ${pos.lng().toFixed(6)}`);
    }
  });
};

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    loading.value = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        if (map.value) {
          map.value.setCenter(pos);
          map.value.setZoom(15);
          const latLng = new google.maps.LatLng(pos.lat, pos.lng);
          placeMarker(latLng);
          geocodePosition(latLng);
        }
        loading.value = false;
      },
      () => {
        error.value = t('errors.geoFailed');
        loading.value = false;
      }
    );
  } else {
    error.value = t('errors.geoUnsupported');
  }
};

onMounted(() => {
  loadGoogleMaps();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-semibold text-secondary">{{ $t('location.selection') }}</label>
      <button 
        type="button"
        @click="getCurrentLocation"
        class="text-sm text-primary font-bold hover:underline flex items-center gap-1"
        :disabled="loading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ loading ? $t('location.locating') : $t('location.useMyLocation') }}
      </button>
    </div>

    <div v-if="error" class="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
      {{ error }}
    </div>

    <div class="relative w-full h-64 rounded-xl overflow-hidden border border-border shadow-inner">
      <div ref="mapContainer" class="w-full h-full bg-gray-100"></div>
      <div v-if="!map" class="absolute inset-0 flex items-center justify-center bg-gray-50 text-light text-sm">
        {{ $t('location.loadingMap') }}
      </div>
    </div>

    <div v-if="address" class="p-3 bg-blue-50 text-secondary text-sm rounded-xl border border-blue-100 flex items-start gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="font-medium">{{ address }}</span>
    </div>
  </div>
</template>
