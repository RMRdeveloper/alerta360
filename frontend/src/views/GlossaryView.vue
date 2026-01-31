<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGlossary } from '../composables/useGlossary';
import {
  glossaryCategoryIdLegal,
  glossaryCategoryIdPlatform,
} from '../constants/glossary.constants';
import type { GlossaryTerm } from '../types';

const { t } = useI18n();
const { categories, loading, error, refetch } = useGlossary();

const searchQuery = ref('');
const expandedCategories = ref<Record<string, boolean>>({});

watch(
  categories,
  (newCategories) => {
    const next: Record<string, boolean> = { ...expandedCategories.value };
    newCategories.forEach((category) => {
      if (next[category.id] === undefined) next[category.id] = true;
    });
    expandedCategories.value = next;
  },
  { immediate: true },
);

const toggleCategory = (categoryId: string) => {
  expandedCategories.value[categoryId] = !(expandedCategories.value[categoryId] ?? true);
};

const filteredCategories = computed((): Array<{ id: string; label: string; terms: GlossaryTerm[] }> => {
  const query = searchQuery.value.toLowerCase().trim();
  const result: Array<{ id: string; label: string; terms: GlossaryTerm[] }> = [];

  for (const category of categories.value) {
    const filtered = category.terms.filter((term: GlossaryTerm) => {
      const termLower = term.term.toLowerCase();
      const definitionLower = term.definition.toLowerCase();
      return termLower.includes(query) || definitionLower.includes(query);
    });
    if (filtered.length === 0) continue;
    result.push({ id: category.id, label: category.label, terms: filtered });
  }

  return result;
});

const hasResults = computed(() => filteredCategories.value.length > 0);

const categoryIcons: Record<string, string> = {
  [glossaryCategoryIdPlatform]: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>`,
  [glossaryCategoryIdLegal]: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>`,
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="relative overflow-hidden bg-surface rounded-[2.5rem] p-8 lg:p-12 shadow-xl shadow-gray-100 border border-white">
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50 to-transparent opacity-50 rounded-l-full blur-3xl -z-10"></div>

      <div class="relative z-10 max-w-2xl space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {{ t('glossary.title') }}
        </div>

        <h1 class="text-4xl lg:text-5xl font-extrabold tracking-tight text-secondary leading-tight">
          {{ t('glossary.title') }}
        </h1>

        <p class="text-lg text-light max-w-xl leading-relaxed">
          {{ t('glossary.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Loading -->
    <section v-if="loading" class="bg-surface rounded-2xl p-12 shadow-lg shadow-gray-100 border border-white text-center">
      <p class="text-lg text-light">{{ t('glossary.loading') }}</p>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="bg-surface rounded-2xl p-12 shadow-lg shadow-gray-100 border border-white text-center">
      <p class="text-lg text-red-600">{{ error.message }}</p>
      <button
        type="button"
        @click="refetch"
        class="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90"
      >
        {{ t('glossary.retry') }}
      </button>
    </section>

    <template v-else>
      <!-- Search -->
      <section class="bg-surface rounded-2xl p-6 shadow-lg shadow-gray-100 border border-white">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('glossary.searchPlaceholder')"
            class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-secondary"
          />
        </div>
      </section>

      <!-- Terms by Category -->
      <section v-if="hasResults" class="space-y-6">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="bg-surface rounded-3xl shadow-lg shadow-gray-100 border border-white overflow-hidden"
        >
          <!-- Category Header -->
          <button
            @click="toggleCategory(category.id)"
            class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-2xl"
                :class="category.id === glossaryCategoryIdPlatform ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'"
                v-html="categoryIcons[category.id] ?? ''"
              ></div>
              <h2 class="text-xl font-bold text-secondary">
                {{ category.label }}
              </h2>
              <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                {{ category.terms.length }}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-400 transition-transform duration-300"
              :class="{ 'rotate-180': expandedCategories[category.id] !== false }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Terms List -->
          <div
            v-show="expandedCategories[category.id] !== false"
            class="border-t border-gray-100"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
              <div
                v-for="term in category.terms"
                :key="term.key"
                class="bg-white p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 class="text-lg font-bold text-secondary mb-2">
                  {{ term.term }}
                </h3>
                <p class="text-light leading-relaxed">
                  {{ term.definition }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- No Results -->
      <section
        v-else
        class="bg-surface rounded-3xl p-12 shadow-lg shadow-gray-100 border border-white text-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg text-light">
          {{ t('glossary.noResults') }}
        </p>
      </section>
    </template>
  </div>
</template>
