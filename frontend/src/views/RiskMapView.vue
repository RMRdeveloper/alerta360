<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRiskMap, type TimeFilter } from '../composables/useRiskMap';
import { useGeolocation } from '../composables/useGeolocation';
import { useShareProfile } from '../composables/useShareProfile';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import { apiRoutes, paginationConstants } from '../constants/api.constants';
import { routePaths } from '../constants/routes.constants';
import { missingStatus } from '../constants/filter.constants';
import type { MissingPerson } from '../types';
import MissingPersonSelector from '../components/MissingPersonSelector.vue';
import { usePhotoUrl } from '../composables/usePhotoUrl';
import { formatDate } from '../utils';

const { t, locale } = useI18n();
const mapContainer = ref<HTMLElement | null>(null);
const shareModalPerson = ref<MissingPerson | null>(null);
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
  panToCase,
} = useRiskMap();
const { getCurrentPosition, loading: geoLoading } = useGeolocation();

const getShareMessage = () => {
  if (!shareModalPerson.value) return '';
  return t('share.message', {
    name: shareModalPerson.value.name,
    date: formatDate(shareModalPerson.value.lastSeenDate, locale.value, 'long'),
  });
};

const getShareUrl = () => {
  if (!shareModalPerson.value) return '';
  return `${window.location.origin}${routePaths.missingPersonDetail(shareModalPerson.value._id)}`;
};

const {
  shareProfile,
  copyLink,
  shareToSocial,
  isShareModalOpen,
  showCopiedTooltip,
} = useShareProfile(shareModalPerson, getShareMessage, getShareUrl);

const handleMapContainerClick = (event: MouseEvent) => {
  const shareButton = (event.target as HTMLElement).closest('[data-share-person-id]');
  if (!shareButton) return;

  event.preventDefault();
  const personId = shareButton.getAttribute('data-share-person-id');
  if (!personId) return;

  const person = getFilteredCases().find((p) => p._id === personId);
  if (!person) return;

  shareModalPerson.value = person;
  shareProfile();
};

const handleCloseShareModal = () => {
  isShareModalOpen.value = false;
  shareModalPerson.value = null;
};

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

    <div ref="mapContainer" class="w-full h-full" @click="handleMapContainerClick"></div>

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
    <!-- Share Modal -->
    <div
      v-if="isShareModalOpen"
      class="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="handleCloseShareModal"
    >
      <div class="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-secondary">{{ $t('share.title') }}</h3>
          <button @click="handleCloseShareModal" class="text-light hover:text-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <button @click="shareToSocial('whatsapp')" class="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            {{ $t('share.whatsapp') }}
          </button>
          <button @click="shareToSocial('facebook')" class="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            {{ $t('share.facebook') }}
          </button>
          <button @click="shareToSocial('twitter')" class="w-full flex items-center gap-4 p-4 rounded-xl bg-black/5 text-black hover:bg-black/10 transition-all font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            {{ $t('share.twitter') }}
          </button>
          <hr class="border-border/50" />
          <button @click="copyLink" class="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 text-secondary hover:bg-gray-100 transition-all font-bold border border-border">
            <div class="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ $t('share.copyLink') }}
            </div>
            <span v-if="showCopiedTooltip" class="text-xs bg-green-500 text-white px-2 py-1 rounded-md">{{ $t('share.copied') }}</span>
          </button>
        </div>
      </div>
    </div>

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
