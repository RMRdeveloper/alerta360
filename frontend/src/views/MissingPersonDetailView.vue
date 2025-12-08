<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import type { MissingPerson } from '../types';

interface Sighting {
  _id: string;
  location: string;
  date: string;
  description: string;
  photo?: string;
}

const route = useRoute();
const { locale } = useI18n();
const person = ref<MissingPerson | null>(null);
const sightings = ref<Sighting[]>([]);
const loading = ref(true);
const currentPhotoIndex = ref(0);
const isFullscreen = ref(false);
const selectedSightingPhoto = ref<string | null>(null);
const isShareModalOpen = ref(false);
const showCopiedTooltip = ref(false);

const shareProfile = async () => {
  if (!person.value) return;
  
  const shareData = {
    title: `Alerta360: ${person.value.name}`,
    text: `Ayuda a encontrar a ${person.value.name}. Desaparecido desde ${formatDate(person.value.lastSeenDate)}.`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log('Error sharing:', err);
    }
  } else {
    isShareModalOpen.value = true;
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  showCopiedTooltip.value = true;
  setTimeout(() => {
    showCopiedTooltip.value = false;
  }, 2000);
};

const shareToSocial = (network: string) => {
  if (!person.value) return;
  
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Ayuda a encontrar a ${person.value.name}. Desaparecido desde ${formatDate(person.value.lastSeenDate)}.`);
  
  let shareUrl = '';
  switch (network) {
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${text}%20${url}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank');
  }
};

const nextPhoto = () => {
  if (person.value && person.value.photos) {
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % person.value.photos.length;
  }
};

const prevPhoto = () => {
  if (person.value && person.value.photos) {
    currentPhotoIndex.value = (currentPhotoIndex.value - 1 + person.value.photos.length) % person.value.photos.length;
  }
};

onMounted(async () => {
  try {
    const [personRes, sightingsRes] = await Promise.all([
      api.get(`/missing-persons/${route.params.id}`),
      api.get(`/sightings/person/${route.params.id}`)
    ]);
    person.value = personRes.data;
    sightings.value = sightingsRes.data;
  } catch (error) {
    console.error('Error fetching details:', error);
  } finally {
    loading.value = false;
  }
});

const openSightingPhoto = (photo: string) => {
  selectedSightingPhoto.value = photo;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(locale.value, { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
};
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'https://placehold.co/600x800/2d3436/ffffff?text=No+Image';
};

const getPhotoUrl = (photoPath?: string) => {
  if (!photoPath) return 'https://placehold.co/600x800/2d3436/ffffff?text=No+Image';
  if (photoPath.startsWith('http')) return photoPath;
  return `http://localhost:3000${photoPath}`;
};
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
    
    <div v-else-if="!person" class="text-center py-20 bg-surface rounded-3xl shadow-sm border border-border">
      <p class="text-primary text-xl font-semibold">{{ $t('detail.notFound') }}</p>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left Column: Image & Status -->
      <div class="lg:col-span-5 space-y-6">
        <div class="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 aspect-[4/5] group">
          <!-- Carousel Images -->
          <div class="relative w-full h-full">
            <template v-if="person.photos && person.photos.length > 0">
              <div 
                v-for="(photo, index) in person.photos" 
                :key="index"
                class="absolute inset-0 transition-opacity duration-500 ease-in-out"
                :class="{ 'opacity-100 z-10': currentPhotoIndex === index, 'opacity-0 z-0': currentPhotoIndex !== index }"
              >
                <img 
                  :src="getPhotoUrl(photo)" 
                  :alt="person.name" 
                  @error="handleImageError"
                  class="w-full h-full object-cover"
                />
              </div>
            </template>
            <img 
              v-else
              src="https://placehold.co/600x800/2d3436/ffffff?text=No+Image" 
              :alt="person.name" 
              class="w-full h-full object-cover"
            />
            
            <!-- Overlay Gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50 z-20 pointer-events-none"></div>
          </div>

          <!-- Navigation Arrows -->
          <button 
            v-if="person.photos && person.photos.length > 1"
            @click="prevPhoto"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            v-if="person.photos && person.photos.length > 1"
            @click="nextPhoto"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Indicators -->
          <div 
            v-if="person.photos && person.photos.length > 1"
            class="absolute bottom-20 left-0 right-0 z-30 flex justify-center gap-2"
          >
            <button 
              v-for="(_, index) in person.photos" 
              :key="index"
              @click="currentPhotoIndex = index"
              class="w-2 h-2 rounded-full transition-all"
              :class="currentPhotoIndex === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'"
            ></button>
          </div>

          <div class="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="isFullscreen = true"
              class="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          <div class="absolute bottom-6 left-6 right-6 z-20">
              <span 
              class="inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md mb-2"
              :class="{
                'bg-primary': person.status === 'missing',
                'bg-green-500': person.status === 'found'
              }"
            >
              {{ $t('filters.' + person.status.toLowerCase()) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Fullscreen Modal -->
      <div v-if="isFullscreen" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" @click.self="isFullscreen = false">
        <!-- ... (existing modal content) ... -->
        <button 
          @click="isFullscreen = false"
          class="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="relative w-full h-full flex items-center justify-center p-4">
          <img 
            v-if="person.photos && person.photos.length > 0"
            :src="getPhotoUrl(person.photos[currentPhotoIndex])" 
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          
          <!-- Fullscreen Navigation -->
          <button 
            v-if="person.photos && person.photos.length > 1"
            @click.stop="prevPhoto"
            class="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            v-if="person.photos && person.photos.length > 1"
            @click.stop="nextPhoto"
            class="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Sighting Photo Modal -->
      <div v-if="selectedSightingPhoto" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" @click.self="selectedSightingPhoto = null">
        <button 
          @click="selectedSightingPhoto = null"
          class="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="relative w-full h-full flex items-center justify-center p-4">
          <img 
            :src="getPhotoUrl(selectedSightingPhoto)" 
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      <!-- Share Modal -->
      <div v-if="isShareModalOpen" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="isShareModalOpen = false">
        <div class="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white transform transition-all scale-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-secondary">{{ $t('share.title') }}</h3>
            <button @click="isShareModalOpen = false" class="text-light hover:text-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- WhatsApp -->
            <button @click="shareToSocial('whatsapp')" class="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              {{ $t('share.whatsapp') }}
            </button>
            
            <!-- Facebook -->
            <button @click="shareToSocial('facebook')" class="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              {{ $t('share.facebook') }}
            </button>
            
            <!-- Twitter/X -->
            <button @click="shareToSocial('twitter')" class="w-full flex items-center gap-4 p-4 rounded-xl bg-black/5 text-black hover:bg-black/10 transition-all font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              {{ $t('share.twitter') }}
            </button>
            
            <hr class="border-border/50" />
            
            <!-- Copy Link -->
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
      
      <!-- Right Column: Details -->
      <div class="lg:col-span-7 space-y-8">
        <div>
          <h1 class="text-5xl font-extrabold text-secondary mb-2">{{ person.name }}</h1>
          <p class="text-xl text-light">{{ $t('detail.missingSince') }} {{ formatDate(person.lastSeenDate) }}</p>
        </div>

        <div class="bg-surface rounded-3xl p-8 shadow-lg shadow-gray-100 border border-white space-y-6">
          <h3 class="text-xl font-bold text-secondary border-b border-border pb-4">{{ $t('detail.keyInfo') }}</h3>
          
          <div class="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('missing.age') }}</label>
              <p class="text-2xl font-bold text-secondary">{{ person.age }} <span class="text-sm font-normal text-light">{{ $t('detail.yearsOld') }}</span></p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('form.gender') }}</label>
              <p class="text-2xl font-bold text-secondary">{{ $t('form.' + person.gender.toLowerCase()) }}</p>
            </div>
            
            <div v-if="person.height && person.height.value">
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('form.height') }}</label>
              <p class="text-2xl font-bold text-secondary">{{ person.height.value }} <span class="text-sm font-normal text-light">{{ person.height.unit.toUpperCase() }}</span></p>
            </div>

            <div v-if="person.build">
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('form.build') }}</label>
              <p class="text-2xl font-bold text-secondary capitalize">{{ $t('attributes.build.' + person.build) }}</p>
            </div>

            <div v-if="person.hair">
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('form.hair') }}</label>
              <p class="text-lg font-bold text-secondary capitalize">
                <span v-if="person.hair.color">{{ $t('attributes.hair.' + person.hair.color) }}</span>
                <span v-if="person.hair.color && person.hair.length">, </span>
                <span v-if="person.hair.length">{{ $t('attributes.length.' + person.hair.length) }}</span>
              </p>
            </div>

            <div v-if="person.eyes">
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('form.eyes') }}</label>
              <p class="text-2xl font-bold text-secondary capitalize">{{ $t('attributes.eyes.' + person.eyes) }}</p>
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-semibold text-light mb-1">{{ $t('missing.lastSeen') }}</label>
              <div class="flex items-center gap-2 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-lg font-medium">{{ person.lastSeenLocation }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-surface rounded-3xl p-8 shadow-lg shadow-gray-100 border border-white space-y-4">
          <h3 class="text-xl font-bold text-secondary">{{ $t('form.description') }}</h3>
          <p class="text-secondary leading-relaxed text-lg">{{ person.description }}</p>
        </div>

        <!-- Sightings Section -->
        <div class="bg-surface rounded-3xl p-8 shadow-lg shadow-gray-100 border border-white space-y-6">
          <h3 class="text-xl font-bold text-secondary border-b border-border pb-4">{{ $t('sightings.title') }}</h3>
          
          <div v-if="sightings.length === 0" class="text-center py-8 text-light">
            <p>{{ $t('sightings.none') }}</p>
          </div>

          <div v-else class="space-y-6">
            <div v-for="sighting in sightings" :key="sighting._id" class="relative pl-6 border-l-2 border-primary/30">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>
              
              <div class="space-y-2">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span class="font-bold text-secondary text-lg">{{ sighting.location }}</span>
                  <span class="text-sm font-medium text-light bg-gray-100 px-3 py-1 rounded-full">{{ formatDate(sighting.date) }}</span>
                </div>
                
                <p class="text-secondary">{{ sighting.description }}</p>
                
                <div v-if="sighting.photo" class="mt-3">
                  <img :src="getPhotoUrl(sighting.photo)" class="w-24 h-24 object-cover rounded-xl shadow-sm border border-border hover:scale-105 transition-transform cursor-pointer" @click="openSightingPhoto(sighting.photo)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <router-link 
            :to="{ path: '/report-sighting', query: { personId: person._id } }"
            class="flex-1 px-8 py-4 bg-primary-gradient text-white text-center font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            {{ $t('nav.report') }}
          </router-link>
          
          <button 
            @click="shareProfile"
            class="flex-1 px-8 py-4 bg-white text-secondary font-bold rounded-xl border border-border hover:border-secondary transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {{ $t('detail.share') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
