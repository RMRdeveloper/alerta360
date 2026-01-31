<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRiskMap, type TimeFilter } from '../composables/useRiskMap';
import { useGeolocation } from '../composables/useGeolocation';
import api from '../services/api';
import { apiRoutes, paginationConstants } from '../constants/api.constants';
import { missingStatus } from '../constants/filter.constants';
import type { MissingPerson } from '../types';
import MissingPersonSelector from '../components/MissingPersonSelector.vue';
import { usePhotoUrl } from '../composables/usePhotoUrl';

const mapContainer = ref<HTMLElement | null>(null);
const isDrawerOpen = ref(false);
const { 
  isLoading, 
  errorMessage, 
  activeCasesCount, 
  highRiskZonesCount, 
  timeFilter,
  mapClickCoords,
  initializeMap, 
  centerOnUserLocation,
  setTimeFilter,
  closeReportModal,
  getFilteredCases,
  panToCase
} = useRiskMap();
const { getCurrentPosition, loading: geoLoading } = useGeolocation();

const filters: { label: string; value: TimeFilter }[] = [
  { label: 'riskMap.filterAll', value: 'all' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const missingPersons = ref<MissingPerson[]>([]);
const reportForm = ref({
  missingPersonId: '',
  description: '',
  reporterContact: '',
});
const reportLoading = ref(false);
const reportSuccess = ref(false);

const selectedPerson = computed(() =>
  missingPersons.value.find(p => p._id === reportForm.value.missingPersonId)
);

const { getPhotoUrl: getPhotoUrlFromPath } = usePhotoUrl();
const getPhotoUrl = (person: MissingPerson) => getPhotoUrlFromPath(person.photos?.[0]);

const handleLocateMe = async () => {
  try {
    const position = await getCurrentPosition();
    centerOnUserLocation(position.coords.latitude, position.coords.longitude);
  } catch {
    // Geolocation denied
  }
};

const loadMissingPersons = async () => {
  try {
    const response = await api.get(apiRoutes.missingPersons, {
      params: { factor: paginationConstants.mapPageSize },
    });
    const items = response.data.items ?? [];
    missingPersons.value = items.filter(
      (person: MissingPerson) => person.status === missingStatus
    );
  } catch {
    // Silent fail
  }
};

const locationAddress = ref('');
const geocodingLoading = ref(false);

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) {
      resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      return;
    }
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    });
  });
};

const submitReport = async () => {
  if (!mapClickCoords.value || !reportForm.value.missingPersonId) return;
  
  reportLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('missingPersonId', reportForm.value.missingPersonId);
    formData.append('location', locationAddress.value || `${mapClickCoords.value.lat.toFixed(6)}, ${mapClickCoords.value.lng.toFixed(6)}`);
    formData.append('date', new Date().toISOString());
    formData.append('description', reportForm.value.description);
    formData.append('reporterContact', reportForm.value.reporterContact);

    await api.post(apiRoutes.sightings, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    reportSuccess.value = true;
    setTimeout(() => {
      closeReportModal();
      reportSuccess.value = false;
      reportForm.value = { missingPersonId: '', description: '', reporterContact: '' };
      locationAddress.value = '';
    }, 2000);
  } catch {
    // Error handling
  } finally {
    reportLoading.value = false;
  }
};

watch(mapClickCoords, async (coords) => {
  if (coords) {
    if (missingPersons.value.length === 0) {
      loadMissingPersons();
    }
    geocodingLoading.value = true;
    locationAddress.value = await reverseGeocode(coords.lat, coords.lng);
    geocodingLoading.value = false;
  }
});

onMounted(() => {
  if (mapContainer.value) {
    initializeMap(mapContainer.value);
  }
});
</script>

<template>
  <div class="fixed inset-0 pt-16 bg-gray-900 overflow-hidden">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-20 bg-gray-900 text-white">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p class="text-sm font-semibold tracking-wider uppercase animate-pulse">{{ $t('riskMap.loading') }}</p>
      </div>
    </div>

    <div v-if="errorMessage" class="absolute inset-0 flex items-center justify-center z-20 bg-gray-900 text-white">
      <p class="text-red-400">{{ errorMessage }}</p>
    </div>

    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Time Filter Chips -->
    <div class="absolute top-28 left-1/2 -translate-x-1/2 z-10">
      <div class="flex gap-1 bg-black/50 backdrop-blur-xl p-1 rounded-full border border-white/10">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="setTimeFilter(filter.value)"
          class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          :class="timeFilter === filter.value 
            ? 'bg-primary text-white' 
            : 'text-gray-400 hover:text-white'"
        >
          {{ filter.label.startsWith('riskMap') ? $t(filter.label) : filter.label }}
        </button>
      </div>
    </div>

    <!-- HUD Panel -->
    <div class="absolute bottom-8 left-8 z-10 w-80">
      <div class="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
        <h3 class="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          {{ $t('riskMap.subtitle') }}
        </h3>
        <p class="text-gray-400 text-xs mb-4">{{ $t('riskMap.clickToReport') }}</p>
        
        <div class="space-y-4">
          <div>
            <p class="text-xs text-gray-400 mb-2">{{ $t('riskMap.concentration') }}</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-red-500"></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>{{ $t('riskMap.low') }}</span>
              <span>{{ $t('riskMap.high') }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <div class="flex-1 bg-white/5 rounded-lg p-3 border border-white/5">
              <span class="block text-2xl font-bold text-white">{{ activeCasesCount }}</span>
              <span class="text-[10px] text-gray-400 uppercase tracking-wide">{{ $t('riskMap.activeCase') }}</span>
            </div>
            <div class="flex-1 bg-white/5 rounded-lg p-3 border border-white/5">
              <span class="block text-2xl font-bold text-red-400">{{ highRiskZonesCount }}</span>
              <span class="text-[10px] text-gray-400 uppercase tracking-wide">{{ $t('riskMap.highRiskZone') }}</span>
            </div>
          </div>

          <button
            @click="handleLocateMe"
            :disabled="geoLoading"
            class="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold py-3 rounded-xl border border-blue-500/30 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{ 'animate-pulse': geoLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ geoLoading ? $t('riskMap.locating') : $t('riskMap.myLocation') }}
          </button>

          <button
            @click="isDrawerOpen = !isDrawerOpen"
            class="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl border border-white/10 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Ver lista de casos
          </button>
        </div>
      </div>
    </div>

    <!-- Cases Drawer -->
    <Teleport to="body">
      <div 
        class="fixed top-0 right-0 bottom-0 w-80 z-[60] transition-transform duration-300 ease-out overflow-hidden shadow-2xl"
        :class="[
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full',
          isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
        ]"
      >
        <div class="h-full bg-gray-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col">
          <div class="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 class="text-white font-bold">Casos activos</h3>
            <button @click="isDrawerOpen = false" class="text-gray-400 hover:text-white">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <button
              v-for="person in getFilteredCases()"
              :key="person._id"
              @click="panToCase(person); isDrawerOpen = false"
              class="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
            >
              <img 
                v-if="person.photos?.[0]"
                :src="getPhotoUrl(person)" 
                class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div v-else class="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white font-semibold text-sm truncate">{{ person.name }}</p>
                <p class="text-gray-400 text-xs">{{ person.age }} años</p>
                <p class="text-gray-500 text-xs truncate">{{ person.lastSeenLocation }}</p>
              </div>
            </button>
            
            <div v-if="getFilteredCases().length === 0" class="text-center py-8 text-gray-500">
              No hay casos para el filtro seleccionado
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Report Modal -->
    <div 
      v-if="mapClickCoords" 
      class="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="closeReportModal"
    >
      <div class="bg-surface border border-border rounded-3xl p-6 w-[400px] shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-secondary font-bold text-xl">{{ $t('riskMap.reportTitle') }}</h3>
          <button @click="closeReportModal" class="text-light hover:text-red-500 transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="reportSuccess" class="text-center py-10">
          <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-green-500 font-bold text-lg">{{ $t('riskMap.reportSent') }}</p>
        </div>

        <form v-else @submit.prevent="submitReport" class="space-y-5">
          <!-- Location Preview -->
          <div class="text-sm text-secondary bg-background p-3 rounded-xl flex items-start gap-2">
            <svg class="h-4 w-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span v-if="geocodingLoading" class="text-light">{{ $t('riskMap.locating') }}</span>
            <span v-else>{{ locationAddress }}</span>
          </div>

          <!-- Person Selector -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('riskMap.whoDidYouSee') }}</label>
            <MissingPersonSelector 
              v-model="reportForm.missingPersonId" 
              :people="missingPersons"
            />
          </div>

          <!-- Selected Person Preview -->
          <div v-if="selectedPerson" class="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <img 
              v-if="getPhotoUrl(selectedPerson)"
              :src="getPhotoUrl(selectedPerson)" 
              class="w-16 h-16 rounded-xl object-cover shadow-sm"
            />
            <div v-else class="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              Sin foto
            </div>
            <div>
              <p class="font-bold text-secondary">{{ selectedPerson.name }}</p>
              <p class="text-xs text-light">{{ selectedPerson.age }} {{ $t('missing.years') }} • {{ selectedPerson.gender }}</p>
              <p class="text-xs text-light mt-1">{{ selectedPerson.lastSeenLocation }}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('riskMap.description') }}</label>
            <textarea 
              v-model="reportForm.description"
              rows="3"
              :placeholder="$t('riskMap.descriptionPlaceholder')"
              class="w-full bg-background border border-border rounded-xl px-4 py-3 text-secondary text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all"
            ></textarea>
          </div>

          <!-- Contact -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('riskMap.yourContact') }}</label>
            <input 
              v-model="reportForm.reporterContact"
              type="text"
              required
              :placeholder="$t('riskMap.contactPlaceholder')"
              class="w-full bg-background border border-border rounded-xl px-4 py-3 text-secondary text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            :disabled="reportLoading || !reportForm.missingPersonId"
            class="w-full py-4 bg-primary-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            {{ reportLoading ? $t('riskMap.sending') : $t('riskMap.sendReport') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
