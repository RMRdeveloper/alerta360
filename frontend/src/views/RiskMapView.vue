<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRiskMap } from '../composables/useRiskMap';

const mapContainer = ref<HTMLElement | null>(null);
const { isLoading, errorMessage, activeCasesCount, highRiskZonesCount, initializeMap } = useRiskMap();

onMounted(() => {
  if (mapContainer.value) {
    initializeMap(mapContainer.value);
  }
});
</script>

<template>
  <div class="fixed inset-0 pt-16 bg-gray-900">
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

    <div class="absolute bottom-8 left-8 z-10 w-80">
      <div class="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
        <h3 class="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          {{ $t('riskMap.subtitle') }}
        </h3>
        <p class="text-gray-400 text-xs mb-4">Monitor de actividad en tiempo real</p>
        
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs text-gray-300 mb-1">
              <span>{{ $t('riskMap.sensitivity') }}</span>
              <span>85%</span>
            </div>
            <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-600 w-[85%]"></div>
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
        </div>
      </div>
    </div>
  </div>
</template>
