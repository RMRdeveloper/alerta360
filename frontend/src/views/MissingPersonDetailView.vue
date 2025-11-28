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
            to="/report-sighting" 
            class="flex-1 px-8 py-4 bg-primary-gradient text-white text-center font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            {{ $t('nav.report') }}
          </router-link>
          
          <button class="flex-1 px-8 py-4 bg-white text-secondary font-bold rounded-xl border border-border hover:border-secondary transition-all duration-300">
            {{ $t('detail.share') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
