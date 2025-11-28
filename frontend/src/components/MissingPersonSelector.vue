<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MissingPerson } from '../types';

const props = defineProps<{
  modelValue: string;
  people: MissingPerson[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');

const selectedPerson = computed(() => 
  props.people.find(p => p._id === props.modelValue)
);

const filteredPeople = computed(() => {
  if (!searchQuery.value) return props.people;
  const query = searchQuery.value.toLowerCase();
  return props.people.filter(p => 
    p.name.toLowerCase().includes(query)
  );
});

const selectPerson = (person: MissingPerson) => {
  emit('update:modelValue', person._id);
  isOpen.value = false;
};

const getPhotoUrl = (person: MissingPerson) => {
  if (person.photos && person.photos.length > 0) {
    const photoPath = person.photos[0];
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:3000${photoPath}`;
  }
  return 'https://placehold.co/400x400/2d3436/ffffff?text=No+Image';
};
</script>

<template>
  <div class="w-full">
    <!-- Trigger Button -->
    <button 
      type="button"
      @click="isOpen = true"
      class="w-full px-5 py-3 bg-background border border-border rounded-xl flex items-center justify-between hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group"
    >
      <div class="flex items-center gap-3" v-if="selectedPerson">
        <img 
          :src="getPhotoUrl(selectedPerson)" 
          class="w-10 h-10 rounded-full object-cover border border-border"
        />
        <div class="text-left">
          <p class="font-bold text-secondary text-sm">{{ selectedPerson.name }}</p>
          <p class="text-xs text-light">{{ selectedPerson.age }} {{ $t('missing.years') }}</p>
        </div>
      </div>
      <span v-else class="text-light">{{ $t('report.selectPerson') }}</span>
      
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-light group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Modal -->
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="isOpen = false">
      <div class="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        
        <!-- Header -->
        <div class="p-6 border-b border-border flex justify-between items-center">
          <h3 class="text-xl font-bold text-secondary">{{ $t('report.selectPerson') }}</h3>
          <button @click="isOpen = false" class="text-light hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="p-4 bg-background/50">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="$t('nav.missing')"
              class="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <!-- List -->
        <div class="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            v-for="person in filteredPeople" 
            :key="person._id"
            @click="selectPerson(person)"
            class="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            :class="{ 'border-primary bg-primary/5 ring-1 ring-primary': modelValue === person._id }"
          >
            <img 
              :src="getPhotoUrl(person)" 
              class="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <p class="font-bold text-secondary group-hover:text-primary transition-colors">{{ person.name }}</p>
              <p class="text-xs text-light">{{ person.age }} {{ $t('missing.years') }} • {{ person.gender }}</p>
            </div>
          </button>

          <div v-if="filteredPeople.length === 0" class="col-span-full text-center py-8 text-light">
            {{ $t('selector.noResults') }}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
