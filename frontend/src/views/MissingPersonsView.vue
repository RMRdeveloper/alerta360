<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Paginator from 'primevue/paginator';
import InputNumber from 'primevue/inputnumber';
import api from '../services/api';
import { apiRoutes, paginationConstants } from '../constants/api.constants';
import {
  hairColors,
  hairLengths,
  eyeColors,
  buildTypes,
  genderOptions,
  heightUnits,
} from '../constants/filter.constants';
import { rewardCurrencies } from '../constants/reward.constants';
import type { MissingPerson, PaginatedMissingPersons } from '../types';
import MissingPersonCard from '../components/MissingPersonCard.vue';
import { useI18n } from 'vue-i18n';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const { t } = useI18n();

const currencyInputLocale = 'en-US';

const filterRewardInputClass =
  'w-full px-3 py-2 !bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-light';

const filterForm = ref({
  name: '',
  status: '' as string,
  sort: '' as string,
  gender: '' as string,
  hasSightings: false,
  minAge: null as number | null,
  maxAge: null as number | null,
  lastSeenFrom: null as Date | string | null,
  lastSeenTo: null as Date | string | null,
  minHeight: null as number | null,
  maxHeight: null as number | null,
  heightUnit: 'cm' as string,
  hairColor: '' as string,
  hairLength: '' as string,
  eyes: '' as string,
  build: '' as string,
  minRewardAmount: null as number | null,
  rewardCurrency: '' as string,
});

const people = ref<MissingPerson[]>([]);
const loading = ref(true);
const page = ref(1);
const factor = ref<number>(paginationConstants.defaultPageSize);
const total = ref(0);
const totalPages = ref(0);
const isFilterDrawerOpen = ref(false);

const first = computed(() => (page.value - 1) * factor.value);

const currentPageReportTemplate = computed(() => {
  return `${t('pagination.showing')} {first} ${t('pagination.to')} {last} ${t('pagination.of')} {totalRecords} ${t('pagination.results')}`;
});

function buildParams(): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: page.value,
    factor: factor.value,
  };

  if (filterForm.value.status) params.status = filterForm.value.status;
  if (filterForm.value.sort) params.sort = filterForm.value.sort;
  if (filterForm.value.name?.trim()) params.name = filterForm.value.name.trim();
  if (filterForm.value.gender) params.gender = filterForm.value.gender;
  if (filterForm.value.hasSightings) params.hasSightings = 'true';
  if (filterForm.value.minAge != null) params.minAge = filterForm.value.minAge;
  if (filterForm.value.maxAge != null) params.maxAge = filterForm.value.maxAge;

  const from = filterForm.value.lastSeenFrom;
  if (from) {
    params.lastSeenFrom =
      from instanceof Date ? from.toISOString() : String(from);
  }
  const to = filterForm.value.lastSeenTo;
  if (to) {
    params.lastSeenTo = to instanceof Date ? to.toISOString() : String(to);
  }

  if (filterForm.value.minHeight != null)
    params.minHeight = filterForm.value.minHeight;
  if (filterForm.value.maxHeight != null)
    params.maxHeight = filterForm.value.maxHeight;
  if (
    (filterForm.value.minHeight != null || filterForm.value.maxHeight != null) &&
    filterForm.value.heightUnit
  ) {
    params.heightUnit = filterForm.value.heightUnit;
  }

  if (filterForm.value.hairColor) params.hairColor = filterForm.value.hairColor;
  if (filterForm.value.hairLength)
    params.hairLength = filterForm.value.hairLength;
  if (filterForm.value.eyes) params.eyes = filterForm.value.eyes;
  if (filterForm.value.build) params.build = filterForm.value.build;

  if (filterForm.value.minRewardAmount != null)
    params.minRewardAmount = filterForm.value.minRewardAmount;
  if (filterForm.value.rewardCurrency)
    params.rewardCurrency = filterForm.value.rewardCurrency;

  return params;
}

function hasActiveFilters(): boolean {
  return !!(
    filterForm.value.name?.trim() ||
    filterForm.value.status ||
    filterForm.value.sort ||
    filterForm.value.gender ||
    filterForm.value.hasSightings ||
    filterForm.value.minAge != null ||
    filterForm.value.maxAge != null ||
    filterForm.value.lastSeenFrom ||
    filterForm.value.lastSeenTo ||
    filterForm.value.minHeight != null ||
    filterForm.value.maxHeight != null ||
    filterForm.value.hairColor ||
    filterForm.value.hairLength ||
    filterForm.value.eyes ||
    filterForm.value.build ||
    filterForm.value.minRewardAmount != null ||
    filterForm.value.rewardCurrency
  );
}

function clearFilters() {
  filterForm.value = {
    name: '',
    status: '',
    sort: '',
    gender: '',
    hasSightings: false,
    minAge: null,
    maxAge: null,
    lastSeenFrom: null,
    lastSeenTo: null,
    minHeight: null,
    maxHeight: null,
    heightUnit: 'cm',
    hairColor: '',
    hairLength: '',
    eyes: '',
    build: '',
    minRewardAmount: null,
    rewardCurrency: '',
  };
  page.value = 1;
  isFilterDrawerOpen.value = false;
  fetchMissingPersons();
}

async function fetchMissingPersons() {
  loading.value = true;
  try {
    const params = buildParams();
    const response = await api.get<PaginatedMissingPersons>(
      apiRoutes.missingPersons,
      { params },
    );
    people.value = response.data.items;
    total.value = response.data.total;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('Error fetching missing persons:', error);
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  isFilterDrawerOpen.value = false;
  fetchMissingPersons();
}

function onPageChange(event: { first: number; rows: number; page: number }) {
  page.value = event.page + 1;
  factor.value = event.rows;
  fetchMissingPersons();
}

onMounted(() => {
  fetchMissingPersons();
});
</script>

<template>
  <div class="flex flex-col md:flex-row gap-8">
    <!-- Sidebar: filters panel (desktop) -->
    <aside class="hidden md:block w-72 flex-shrink-0">
      <div
        class="bg-surface border border-border rounded-xl p-4 sticky top-32 space-y-6"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-secondary">
            {{ $t('missing.filtersTitle') }}
          </h2>
          <button
            v-if="hasActiveFilters()"
            type="button"
            @click="clearFilters"
            class="text-xs font-medium text-primary hover:underline"
          >
            {{ $t('filters.clearFilters') }}
          </button>
        </div>

        <!-- Status & Sort -->
        <div class="space-y-3">
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.status') }}
          </label>
          <select
            v-model="filterForm.status"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="missing">{{ $t('filters.missing') }}</option>
            <option value="found">{{ $t('filters.found') }}</option>
            <option value="deceased">{{ $t('filters.deceased') }}</option>
          </select>
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.recent') }}
          </label>
          <select
            v-model="filterForm.sort"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option value="recent">{{ $t('filters.recent') }}</option>
          </select>
        </div>

        <!-- With sighting reports -->
        <div class="space-y-2">
          <label
            class="flex items-center gap-2 cursor-pointer text-sm text-secondary"
          >
            <input
              v-model="filterForm.hasSightings"
              type="checkbox"
              @change="applyFilters"
              class="rounded border-border text-primary focus:ring-primary/20"
            />
            {{ $t('filters.hasSightings') }}
          </label>
        </div>

        <!-- Name search -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-secondary">
            {{ $t('form.name') }}
          </label>
          <input
            v-model="filterForm.name"
            type="text"
            :placeholder="$t('filters.namePlaceholder')"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-light focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="button"
            @click="applyFilters"
            class="w-full py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
          >
            {{ $t('form.submit') }}
          </button>
        </div>

        <!-- Gender -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-secondary">
            {{ $t('form.gender') }}
          </label>
          <select
            v-model="filterForm.gender"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option v-for="g in genderOptions" :key="g" :value="g">
              {{ $t(`form.${g.toLowerCase()}`) }}
            </option>
          </select>
        </div>

        <!-- Age range -->
        <div class="space-y-2 grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-secondary">
              {{ $t('filters.minAge') }}
            </label>
            <input
              v-model.number="filterForm.minAge"
              type="number"
              min="0"
              max="150"
              class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-secondary">
              {{ $t('filters.maxAge') }}
            </label>
            <input
              v-model.number="filterForm.maxAge"
              type="number"
              min="0"
              max="150"
              class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="button"
            @click="applyFilters"
            class="col-span-2 py-2 text-sm font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            {{ $t('form.submit') }}
          </button>
        </div>

        <!-- Last seen date range -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.lastSeenFrom') }}
          </label>
          <VueDatePicker
            v-model="filterForm.lastSeenFrom"
            :enable-time-picker="false"
            auto-apply
            :teleport="true"
            input-class-name="!bg-background !border-border !rounded-lg !py-2 !px-3 !text-sm text-secondary focus:!ring-2 focus:!ring-primary/20 focus:!border-primary"
          />
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.lastSeenTo') }}
          </label>
          <VueDatePicker
            v-model="filterForm.lastSeenTo"
            :enable-time-picker="false"
            auto-apply
            :teleport="true"
            input-class-name="!bg-background !border-border !rounded-lg !py-2 !px-3 !text-sm text-secondary focus:!ring-2 focus:!ring-primary/20 focus:!border-primary"
          />
          <button
            type="button"
            @click="applyFilters"
            class="w-full py-2 text-sm font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            {{ $t('form.submit') }}
          </button>
        </div>

        <!-- Height -->
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-secondary mb-2">
                {{ $t('filters.minHeight') }}
              </label>
              <input
                v-model.number="filterForm.minHeight"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary mb-2">
                {{ $t('filters.maxHeight') }}
              </label>
              <input
                v-model.number="filterForm.maxHeight"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.heightUnit') }}
          </label>
          <select
            v-model="filterForm.heightUnit"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option v-for="u in heightUnits" :key="u" :value="u">{{ u }}</option>
          </select>
          <button
            type="button"
            @click="applyFilters"
            class="w-full py-2 text-sm font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            {{ $t('form.submit') }}
          </button>
        </div>

        <!-- Reward -->
        <div class="filter-reward-section space-y-2">
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.minRewardAmount') }}
          </label>
          <InputNumber
            v-model="filterForm.minRewardAmount"
            mode="currency"
            :currency="filterForm.rewardCurrency || 'USD'"
            :locale="currencyInputLocale"
            :min="0"
            :placeholder="$t('form.rewardPlaceholder')"
            fluid
            :input-class="filterRewardInputClass"
          />
          <label class="block text-xs font-medium text-secondary">
            {{ $t('filters.rewardCurrency') }}
          </label>
          <select
            v-model="filterForm.rewardCurrency"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option v-for="code in rewardCurrencies" :key="code" :value="code">
              {{ $t('currencies.' + code) }}
            </option>
          </select>
          <button
            type="button"
            @click="applyFilters"
            class="w-full py-2 text-sm font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            {{ $t('form.submit') }}
          </button>
        </div>

        <!-- Physical: hair, eyes, build -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-secondary">
            {{ $t('form.hairColor') }}
          </label>
          <select
            v-model="filterForm.hairColor"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option v-for="c in hairColors" :key="c" :value="c">
              {{ $t(`attributes.hair.${c}`) }}
            </option>
          </select>
          <label class="block text-xs font-medium text-secondary">
            {{ $t('form.hairLength') }}
          </label>
          <select
            v-model="filterForm.hairLength"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option v-for="l in hairLengths" :key="l" :value="l">
              {{ $t(`attributes.length.${l}`) }}
            </option>
          </select>
          <label class="block text-xs font-medium text-secondary">
            {{ $t('form.eyeColor') }}
          </label>
          <select
            v-model="filterForm.eyes"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option v-for="e in eyeColors" :key="e" :value="e">
              {{ $t(`attributes.eyes.${e}`) }}
            </option>
          </select>
          <label class="block text-xs font-medium text-secondary">
            {{ $t('form.build') }}
          </label>
          <select
            v-model="filterForm.build"
            @change="applyFilters"
            class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option v-for="b in buildTypes" :key="b" :value="b">
              {{ $t(`attributes.build.${b}`) }}
            </option>
          </select>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 min-w-0 space-y-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-extrabold text-secondary mb-2">
            {{ $t('missing.title') }}
          </h1>
          <p class="text-light text-lg">{{ $t('missing.subtitle') }}</p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            @click="isFilterDrawerOpen = true"
            class="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-secondary font-medium hover:border-primary hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {{ $t('missing.filtersTitle') }}
          </button>
          <router-link
            to="/register-missing"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {{ $t('nav.register') }}
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
        ></div>
      </div>

      <div
        v-else-if="people.length === 0"
        class="text-center py-20 bg-surface rounded-3xl border border-dashed border-border"
      >
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-secondary">
          {{ $t('missing.noReports') }}
        </h3>
        <p class="text-light">{{ $t('missing.emptyState') }}</p>
      </div>

      <div v-else>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8"
        >
          <MissingPersonCard
            v-for="person in people"
            :key="person._id"
            :person="person"
          />
        </div>

        <div v-if="total > 0" class="flex justify-center app-paginator">
          <Paginator
            v-model:first="first"
            :rows="factor"
            :totalRecords="total"
            :rowsPerPageOptions="[15, 30, 45]"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            :currentPageReportTemplate="currentPageReportTemplate"
            @page="onPageChange"
          />
        </div>
      </div>
    </div>

    <!-- Mobile: filter drawer -->
    <Teleport to="body">
      <div
        v-if="isFilterDrawerOpen"
        class="fixed inset-0 z-50 md:hidden"
        aria-modal="true"
        role="dialog"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="isFilterDrawerOpen = false"
        />
        <div
          class="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-surface border-l border-border shadow-xl flex flex-col overflow-y-auto"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10"
          >
            <h2 class="text-lg font-semibold text-secondary">
              {{ $t('missing.filtersTitle') }}
            </h2>
            <div class="flex items-center gap-2">
              <button
                v-if="hasActiveFilters()"
                type="button"
                @click="clearFilters"
                class="text-sm font-medium text-primary hover:underline"
              >
                {{ $t('filters.clearFilters') }}
              </button>
              <button
                type="button"
                @click="isFilterDrawerOpen = false"
                class="p-2 rounded-lg text-light hover:text-secondary hover:bg-background transition-colors"
                aria-label="Cerrar"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-4 space-y-6 overflow-y-auto">
            <div class="space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('filters.status') }}
              </label>
              <select
                v-model="filterForm.status"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
              >
                <option value="">{{ $t('filters.all') }}</option>
                <option value="missing">{{ $t('filters.missing') }}</option>
                <option value="found">{{ $t('filters.found') }}</option>
                <option value="deceased">{{ $t('filters.deceased') }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label
                class="flex items-center gap-2 cursor-pointer text-sm text-secondary"
              >
                <input
                  v-model="filterForm.hasSightings"
                  type="checkbox"
                  class="rounded border-border text-primary focus:ring-primary/20"
                />
                {{ $t('filters.hasSightings') }}
              </label>
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('form.name') }}
              </label>
              <input
                v-model="filterForm.name"
                type="text"
                :placeholder="$t('filters.namePlaceholder')"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('form.gender') }}
              </label>
              <select
                v-model="filterForm.gender"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
              >
                <option value="">—</option>
                <option v-for="g in genderOptions" :key="g" :value="g">
                  {{ $t(`form.${g.toLowerCase()}`) }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-2">
                <label class="block text-xs font-medium text-secondary">
                  {{ $t('filters.minAge') }}
                </label>
                <input
                  v-model.number="filterForm.minAge"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-medium text-secondary">
                  {{ $t('filters.maxAge') }}
                </label>
                <input
                  v-model.number="filterForm.maxAge"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('form.hairColor') }}
              </label>
              <select
                v-model="filterForm.hairColor"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
              >
                <option value="">—</option>
                <option v-for="c in hairColors" :key="c" :value="c">
                  {{ $t(`attributes.hair.${c}`) }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('form.eyeColor') }}
              </label>
              <select
                v-model="filterForm.eyes"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
              >
                <option value="">—</option>
                <option v-for="e in eyeColors" :key="e" :value="e">
                  {{ $t(`attributes.eyes.${e}`) }}
                </option>
              </select>
            </div>
            <div class="filter-reward-section space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('filters.minRewardAmount') }}
              </label>
              <InputNumber
                v-model="filterForm.minRewardAmount"
                mode="currency"
                :currency="filterForm.rewardCurrency || 'USD'"
                :locale="currencyInputLocale"
                :min="0"
                :placeholder="$t('form.rewardPlaceholder')"
                fluid
                :input-class="filterRewardInputClass"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-medium text-secondary">
                {{ $t('filters.rewardCurrency') }}
              </label>
              <select
                v-model="filterForm.rewardCurrency"
                class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-secondary"
              >
                <option value="">—</option>
                <option v-for="code in rewardCurrencies" :key="code" :value="code">
                  {{ $t('currencies.' + code) }}
                </option>
              </select>
            </div>
            <button
              type="button"
              @click="applyFilters"
              class="w-full py-3 text-sm font-bold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity"
            >
              {{ $t('form.submit') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
