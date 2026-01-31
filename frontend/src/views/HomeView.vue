<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const stats = ref({
  missing: 0,
  found: 0,
  sightings: 0
});

onMounted(async () => {
  try {
    const response = await api.get('/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
});
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-surface rounded-[2.5rem] p-12 lg:p-20 shadow-xl shadow-gray-100 border border-white">
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-pink-50 to-transparent opacity-50 rounded-l-full blur-3xl -z-10"></div>
      
      <div class="relative z-10 max-w-3xl space-y-8">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-primary text-sm font-semibold">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {{ $t('home.systemActive') }}
        </div>

        <h1 class="text-6xl lg:text-7xl font-extrabold tracking-tight text-secondary leading-[1.1]">
          {{ $t('home.title') }}
          <span class="text-primary">{{ $t('home.now') }}</span>
        </h1>
        
        <p class="text-xl text-light max-w-xl leading-relaxed">
          {{ $t('home.subtitle') }}
        </p>
        
        <div class="flex flex-wrap gap-4 pt-4">
          <router-link 
            to="/missing-persons" 
            class="px-8 py-4 bg-primary-gradient text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            {{ $t('nav.missing') }}
          </router-link>
          <router-link 
            to="/report-sighting" 
            class="px-8 py-4 bg-white text-secondary font-bold rounded-2xl border border-border hover:border-primary hover:text-primary hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            {{ $t('nav.report') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Stats Grid -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="group bg-surface rounded-3xl p-8 shadow-lg shadow-gray-100 border border-white hover:border-pink-100 transition-all duration-300">
        <div class="flex items-start justify-between mb-8">
          <div class="p-3 bg-pink-50 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span class="text-4xl font-black text-secondary">{{ stats.missing }}</span>
        </div>
        <h3 class="text-lg font-bold text-secondary mb-1">{{ $t('missing.title') }}</h3>
        <p class="text-sm text-light">{{ $t('home.activeCases') }}</p>
      </div>
      
      <div class="group bg-surface rounded-3xl p-8 shadow-lg shadow-gray-100 border border-white hover:border-green-100 transition-all duration-300">
        <div class="flex items-start justify-between mb-8">
          <div class="p-3 bg-green-50 rounded-2xl text-green-500 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-4xl font-black text-secondary">{{ stats.found }}</span>
        </div>
        <h3 class="text-lg font-bold text-secondary mb-1">{{ $t('home.foundSafe') }}</h3>
        <p class="text-sm text-light">{{ $t('home.reunited') }}</p>
      </div>
      
      <div class="group bg-surface rounded-3xl p-8 shadow-lg shadow-gray-100 border border-white hover:border-blue-100 transition-all duration-300">
        <div class="flex items-start justify-between mb-8">
          <div class="p-3 bg-blue-50 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span class="text-4xl font-black text-secondary">{{ stats.sightings }}</span>
        </div>
        <h3 class="text-lg font-bold text-secondary mb-1">{{ $t('home.sightings') }}</h3>
        <p class="text-sm text-light">{{ $t('home.reportsReceived') }}</p>
      </div>
    </section>
  </div>
</template>
