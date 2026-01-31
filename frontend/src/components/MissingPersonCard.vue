<script setup lang="ts">
import { defineProps } from 'vue';
import { usePhotoUrl } from '../composables/usePhotoUrl';
import { routeNames } from '../constants/routes.constants';
import type { MissingPerson } from '../types';

defineProps<{
  person: MissingPerson
}>();

const { getPhotoUrl, handleImageError } = usePhotoUrl();
</script>

<template>
  <div class="group relative bg-surface rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border hover:border-primary/20 h-full flex flex-col">
    <!-- Image Container -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <img 
        :src="getPhotoUrl(person.photos[0])" 
        :alt="person.name" 
        @error="handleImageError"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      <!-- Gradient Overlay (Glass Effect) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
      
      <!-- Status Badge -->
      <div class="absolute top-4 left-4">
        <span 
          class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md"
          :class="{
            'bg-primary': person.status === 'missing',
            'bg-green-500': person.status === 'found'
          }"
        >
          {{ $t('filters.' + person.status.toLowerCase()) }}
        </span>
      </div>
    </div>

    <!-- Content Body -->
    <div class="flex flex-col flex-grow p-6">
      <!-- Name -->
      <h3 class="text-xl font-bold text-secondary mb-3 leading-tight line-clamp-2 min-h-[3.5rem]" :title="person.name">
        {{ person.name }}
      </h3>
      
      <!-- Details -->
      <div class="space-y-3 flex-grow">
        <!-- Age -->
        <div class="flex items-start gap-3">
          <div class="p-2 bg-gray-50 rounded-lg text-primary shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-bold text-light uppercase tracking-wide">{{ $t('missing.age') }}</p>
            <p class="font-semibold text-secondary">{{ person.age }} {{ $t('card.years') }}</p>
          </div>
        </div>
        
        <!-- Location -->
        <div class="flex items-start gap-3">
          <div class="p-2 bg-gray-50 rounded-lg text-primary shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="min-w-0"> <!-- min-w-0 required for flex child truncation -->
            <p class="text-xs font-bold text-light uppercase tracking-wide">{{ $t('card.lastSeen') }}</p>
            <p class="font-semibold text-secondary line-clamp-2 text-sm leading-relaxed" :title="person.lastSeenLocation">
              {{ person.lastSeenLocation }}
            </p>
          </div>
        </div>

        <!-- Reward -->
        <div v-if="person.reward" class="flex items-start gap-3">
          <div class="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-bold text-light uppercase tracking-wide">{{ $t('form.reward') }}</p>
            <p class="font-semibold text-secondary text-sm">
              {{ person.reward.amount.toLocaleString() }}
              <span v-if="person.reward.currency">{{ person.reward.currency }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-6 pt-4 border-t border-border">
        <router-link 
          :to="{ name: routeNames.missingPersonDetail, params: { id: person._id } }" 
          class="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20"
        >
          {{ $t('missing.details') }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>
