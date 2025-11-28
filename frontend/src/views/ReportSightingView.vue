<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import type { MissingPerson } from '../types';
import LocationPicker from '../components/LocationPicker.vue';
import MissingPersonSelector from '../components/MissingPersonSelector.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';

const router = useRouter();
const { t } = useI18n();

const form = ref({
  missingPersonId: '',
  location: '',
  date: '',
  description: '',
  reporterContact: '',
  coordinates: null as { type: string; coordinates: number[] } | null,
});

const photoFile = ref<File | null>(null);
const photoPreview = ref<string | null>(null);

const people = ref<MissingPerson[]>([]);
const loading = ref(false);

onMounted(async () => {
  try {
    const response = await api.get('/missing-persons');
    people.value = response.data;
  } catch (error) {
    console.error('Error fetching people:', error);
  }
});

const updateLocation = (address: string) => {
  form.value.location = address;
};

const updateCoordinates = (coords: { type: string; coordinates: number[] }) => {
  form.value.coordinates = coords;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    photoFile.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('missingPersonId', form.value.missingPersonId);
    formData.append('location', form.value.location);
    formData.append('date', new Date(form.value.date).toISOString());
    formData.append('description', form.value.description);
    formData.append('reporterContact', form.value.reporterContact);
    
    if (form.value.coordinates) {
      formData.append('coordinates', JSON.stringify(form.value.coordinates));
    }

    if (photoFile.value) {
      formData.append('photo', photoFile.value);
    }

    await api.post('/sightings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    alert(t('alerts.reportSuccess'));
    router.push(`/missing/${form.value.missingPersonId}`);
  } catch (error) {
    console.error(error);
    alert(t('errors.reportFailed'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-secondary mb-3">{{ $t('nav.report') }}</h1>
      <p class="text-light text-lg">{{ $t('report.subtitle') }}</p>
    </div>
    
    <form @submit.prevent="submitForm" class="bg-surface rounded-3xl shadow-xl shadow-gray-100 border border-white p-8 md:p-10 space-y-8">
      <div class="space-y-6">
        <!-- Step 1: Who -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-secondary">{{ $t('report.who') }}</label>
          <MissingPersonSelector 
            v-model="form.missingPersonId" 
            :people="people"
          />
        </div>

        <!-- Step 2: Where & When -->
        <div class="space-y-4">
          <LocationPicker 
            @update:location="updateLocation"
            @update:coordinates="updateCoordinates"
          />
          <input type="hidden" v-model="form.location" required />

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('report.dateTime') }}</label>
            <VueDatePicker 
              v-model="form.date" 
              :enable-time-picker="true"
              :is-24="false"
              auto-apply
              :teleport="true"
              input-class-name="!bg-background !border-border !rounded-xl !py-3 !px-5 !text-secondary focus:!ring-2 focus:!ring-primary/20 focus:!border-primary !transition-all"
              menu-class-name="!bg-surface !border-border !rounded-xl !shadow-xl"
              calendar-cell-class-name="!rounded-full hover:!bg-primary/10"
              calendar-class-name="!font-sans"
            />
          </div>
        </div>

        <!-- Step 3: Photo Evidence -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-secondary">{{ $t('form.photoEvidence') }} ({{ $t('form.optional') }})</label>
          <div 
            class="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative"
            :class="{ 'bg-gray-50': !photoPreview }"
          >
            <input 
              type="file" 
              accept="image/*" 
              @change="handleFileUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            <div v-if="photoPreview" class="relative z-0">
              <img :src="photoPreview" class="max-h-64 mx-auto rounded-lg shadow-sm" />
              <p class="mt-2 text-sm text-primary font-medium">{{ $t('form.clickToChange') }}</p>
            </div>
            
            <div v-else class="space-y-2">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-secondary font-medium">{{ $t('form.clickToUpload') }}</p>
              <p class="text-xs text-light">{{ $t('form.fileConstraints') }}</p>
            </div>
          </div>
        </div>

        <!-- Step 4: Description & Contact -->
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.description') }}</label>
            <textarea 
              v-model="form.description" 
              rows="4" 
              :placeholder="$t('report.descriptionPlaceholder')"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            ></textarea>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('report.contact') }}</label>
            <input 
              v-model="form.reporterContact" 
              type="text" 
              required 
              :placeholder="$t('report.contactPlaceholder')"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p class="text-xs text-light">{{ $t('report.contactDisclaimer') }}</p>
          </div>
        </div>
      </div>

      <div class="pt-4">
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-4 bg-primary-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {{ loading ? $t('form.submitting') : $t('form.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>
