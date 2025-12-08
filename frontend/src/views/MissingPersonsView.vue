<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import type { MissingPerson } from '../types';
import MissingPersonCard from '../components/MissingPersonCard.vue';

const people = ref<MissingPerson[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/missing-persons');
    people.value = response.data;
  } catch (error) {
    console.error('Error fetching missing persons:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-10">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl font-extrabold text-secondary mb-2">{{ $t('missing.title') }}</h1>
        <p class="text-light text-lg">{{ $t('missing.subtitle') }}</p>
      </div>
      
      <router-link 
        to="/register-missing" 
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('nav.register') }}
      </router-link>
    </div>

    <!-- Filters Placeholder -->
    <div class="flex gap-4 overflow-x-auto pb-2">
      <button class="px-5 py-2 rounded-full bg-secondary text-white font-medium text-sm whitespace-nowrap">{{ $t('filters.all') }}</button>
      <button class="px-5 py-2 rounded-full bg-white border border-border text-secondary font-medium text-sm whitespace-nowrap hover:border-primary hover:text-primary transition-colors">{{ $t('filters.recent') }}</button>
      <button class="px-5 py-2 rounded-full bg-white border border-border text-secondary font-medium text-sm whitespace-nowrap hover:border-primary hover:text-primary transition-colors">{{ $t('filters.missing') }}</button>
      <button class="px-5 py-2 rounded-full bg-white border border-border text-secondary font-medium text-sm whitespace-nowrap hover:border-primary hover:text-primary transition-colors">{{ $t('filters.found') }}</button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
    
    <div v-else-if="people.length === 0" class="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-secondary">{{ $t('missing.noReports') }}</h3>
      <p class="text-light">{{ $t('missing.emptyState') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <MissingPersonCard 
        v-for="person in people" 
        :key="person._id" 
        :person="person" 
      />
    </div>
  </div>
</template>
