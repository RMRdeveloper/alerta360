<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { routePaths } from '../constants/routes.constants';

const { t } = useI18n();
</script>

<template>
  <router-link
    :to="routePaths.glossary"
    class="fixed bottom-6 right-6 z-50 group"
    :aria-label="`Help - ${t('glossary.title')}`"
  >
    <div
      class="w-14 h-14 rounded-full bg-primary-gradient shadow-lg shadow-primary/30 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    
    <!-- Tooltip -->
    <div
      class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-secondary text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none"
    >
      {{ t('glossary.title') }}
      <div class="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-secondary"></div>
    </div>
  </router-link>
</template>
