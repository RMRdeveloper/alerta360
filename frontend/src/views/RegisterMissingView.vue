<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Stepper from 'primevue/stepper';
import StepPanels from 'primevue/steppanels';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import api from '../services/api';
import { apiRoutes, uploadConstants } from '../constants/api.constants';
import {
  hairColors,
  hairLengths,
  eyeColors,
  buildTypes,
} from '../constants/filter.constants';
import { routeNames } from '../constants/routes.constants';
import LocationPicker from '../components/LocationPicker.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { rewardCurrencies } from '../constants/reward.constants';
import { usePhotoUrl } from '../composables/usePhotoUrl';
import type { MissingPerson } from '../types';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { getPhotoUrl, handleImageError } = usePhotoUrl();

const isEditMode = computed(
  () => route.name === routeNames.editMissing && !!route.params.id,
);
const editId = computed(() => route.params.id as string);
/** Locale en-US: coma para miles, punto para decimales */
const currencyInputLocale = 'en-US';

const activeStep = ref('1');
const form = ref({
  name: '',
  age: null as number | null,
  gender: 'Male',
  lastSeenLocation: '',
  lastSeenDate: '',
  description: '',
  coordinates: null as { type: string; coordinates: number[] } | null,
  height: { value: null as number | null, unit: 'cm' },
  hair: { color: '', length: '' },
  eyes: '',
  build: '',
  status: 'missing',
  reward: { amount: null as number | null, currency: 'DOP' },
});

const photoFiles = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);
const existingPhotoUrls = ref<string[]>([]);
const loading = ref(false);
const loadingData = ref(false);
const photoError = ref('');
const showConfirmationModal = ref(false);
const createdMissingPersonId = ref<string | null>(null);

const inputClass =
  'w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary placeholder:text-light';
const selectClass =
  'w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none text-secondary';
const labelClass = 'block text-sm font-semibold text-secondary';

const updateLocation = (address: string) => {
  form.value.lastSeenLocation = address;
};

const updateCoordinates = (coords: { type: string; coordinates: number[] }) => {
  form.value.coordinates = coords;
};

const totalPhotos = computed(() => {
  return existingPhotoUrls.value.length + photoFiles.value.length;
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  photoError.value = '';
  
  if (!target.files) return;

  const files = Array.from(target.files);
  const newTotal = totalPhotos.value + files.length;

  if (newTotal > uploadConstants.maxPhotosPerPost) {
    photoError.value = t('errors.maxPhotos', { max: uploadConstants.maxPhotosPerPost });
    target.value = '';
    return;
  }

  photoFiles.value = [...photoFiles.value, ...files];
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        photoPreviews.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  });
};

const removePhoto = (index: number) => {
  photoFiles.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

const removeExistingPhoto = (index: number) => {
  existingPhotoUrls.value.splice(index, 1);
};

const validateStep1 = () => {
  const { name, age, gender } = form.value;
  if (!name?.trim()) return false;
  if (age === null || age === undefined || age < 0) return false;
  return !!gender;
};

const validateStep3 = () => {
  const { lastSeenLocation, lastSeenDate } = form.value;
  if (!lastSeenLocation?.trim()) return false;
  if (!lastSeenDate) return false;
  return true;
};

const handleNextStep1 = (activateCallback: (step: string) => void) => {
  if (validateStep1()) activateCallback('2');
};

const handleNextStep3 = (activateCallback: (step: string) => void) => {
  if (validateStep3()) activateCallback('4');
};

const isFormValid = computed(
  () => validateStep1() && validateStep3(),
);

const handleSave = () => {
  if (!isFormValid.value) {
    alert(t('form.validationRequired'));
    return;
  }
  submitForm();
};

const loadExistingData = async () => {
  if (!isEditMode.value || !editId.value) return;
  loadingData.value = true;
  try {
    const res = await api.get(apiRoutes.missingPersonById(editId.value));
    const p = res.data as MissingPerson;
    form.value = {
      name: p.name,
      age: p.age,
      gender: p.gender,
      lastSeenLocation: p.lastSeenLocation,
      lastSeenDate: p.lastSeenDate,
      description: p.description ?? '',
      coordinates: p.coordinates ?? null,
      height: p.height
        ? { value: p.height.value, unit: p.height.unit || 'cm' }
        : { value: null, unit: 'cm' },
      hair: p.hair
        ? { color: p.hair.color ?? '', length: p.hair.length ?? '' }
        : { color: '', length: '' },
      eyes: p.eyes ?? '',
      build: p.build ?? '',
      status: p.status ?? 'missing',
      reward: p.reward
        ? {
            amount: p.reward.amount,
            currency: p.reward.currency ?? 'DOP',
          }
        : { amount: null, currency: 'DOP' },
    };
    existingPhotoUrls.value = p.photos ? [...p.photos] : [];
  } catch (error) {
    console.error(error);
    alert(t('errors.loadData'));
    router.push('/');
  } finally {
    loadingData.value = false;
  }
};

onMounted(() => {
  if (isEditMode.value) loadExistingData();
});

const submitForm = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('age', String(form.value.age));
    formData.append('gender', form.value.gender);
    formData.append('lastSeenLocation', form.value.lastSeenLocation);
    formData.append('lastSeenDate', new Date(form.value.lastSeenDate).toISOString());
    formData.append('description', form.value.description);

    if (form.value.height.value) {
      formData.append('height', JSON.stringify(form.value.height));
    }
    if (form.value.hair.color || form.value.hair.length) {
      formData.append('hair', JSON.stringify(form.value.hair));
    }
    if (form.value.eyes) {
      formData.append('eyes', form.value.eyes);
    }
    if (form.value.build) {
      formData.append('build', form.value.build);
    }
    if (form.value.coordinates) {
      formData.append('coordinates', JSON.stringify(form.value.coordinates));
    }
    const rewardAmount = form.value.reward.amount;
    if (typeof rewardAmount === 'number' && rewardAmount >= 0) {
      formData.append(
        'reward',
        JSON.stringify({
          amount: rewardAmount,
          currency: form.value.reward.currency || undefined,
        }),
      );
    }
    if (isEditMode.value) {
      formData.append('status', form.value.status);
      formData.append('existingPhotos', JSON.stringify(existingPhotoUrls.value));
      if (photoFiles.value.length > 0) {
        photoFiles.value.forEach((file) => {
          formData.append('photos', file);
        });
      }
    } else {
      photoFiles.value.forEach((file) => {
        formData.append('photos', file);
      });
    }

    if (isEditMode.value && editId.value) {
      await api.put(apiRoutes.missingPersonById(editId.value), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push({ name: routeNames.missingPersonDetail, params: { id: editId.value } });
    } else {
      const res = await api.post(apiRoutes.missingPersons, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const created = res.data as MissingPerson;
      createdMissingPersonId.value = created._id;
      showConfirmationModal.value = true;
    }
  } catch (error) {
    console.error(error);
    alert(t('errors.registerFailed'));
  } finally {
    loading.value = false;
  }
};

const closeConfirmationAndGoHome = () => {
  showConfirmationModal.value = false;
  createdMissingPersonId.value = null;
  router.push('/');
};

const closeConfirmationAndViewProfile = () => {
  const id = createdMissingPersonId.value;
  showConfirmationModal.value = false;
  createdMissingPersonId.value = null;
  if (id) {
    router.push({ name: routeNames.missingPersonDetail, params: { id } });
  } else {
    router.push('/');
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-secondary mb-3">
        {{ isEditMode ? $t('register.editTitle') : $t('nav.register') }}
      </h1>
      <p class="text-light text-lg">
        {{ isEditMode ? $t('register.editSubtitle') : $t('register.subtitle') }}
      </p>
    </div>

    <div v-if="loadingData" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <form
      v-else
      @submit.prevent="submitForm"
      class="bg-surface rounded-3xl shadow-xl shadow-gray-100 border border-white p-8 md:p-10"
    >
      <!-- Custom stepper indicator - symmetric grid: step | line | step | line | step | line | step -->
      <div class="register-stepper mb-12">
        <div class="grid grid-cols-7 gap-x-4 sm:gap-x-6 items-start w-full">
          <template v-for="(step, idx) in 4" :key="step">
            <div class="flex flex-col items-center justify-center col-span-1">
              <div
                :class="[
                  'w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  Number(activeStep) > step
                    ? 'bg-primary text-white'
                    : Number(activeStep) === step
                      ? 'border-2 border-primary text-primary bg-surface'
                      : 'border-2 border-border text-light bg-surface',
                ]"
              >
                <span v-if="Number(activeStep) > step">✓</span>
                <span v-else>{{ step }}</span>
              </div>
              <span
                :class="[
                  'text-xs mt-1.5 font-medium text-center max-w-[5rem] sm:max-w-[4.5rem]',
                  Number(activeStep) >= step ? 'text-secondary' : 'text-light',
                ]"
              >
                {{ $t(`register.step${step}`) }}
              </span>
            </div>
            <div
              v-if="idx < 3"
              :class="[
                'h-1 w-full transition-colors self-center mt-5 rounded-full',
                Number(activeStep) > step ? 'bg-primary' : 'bg-[var(--color-secondary-light)]',
              ]"
            ></div>
          </template>
        </div>
      </div>
      <Stepper v-model:value="activeStep" linear class="register-stepper-panels mb-8 pt-2">
        <StepPanels>
          <!-- Step 1: Basic Info -->
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.name') }} <span class="text-primary">*</span></label>
                  <input v-model="form.name" type="text" required :placeholder="$t('form.fullNamePlaceholder')" :class="inputClass" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label :class="labelClass">{{ $t('form.age') }} <span class="text-primary">*</span></label>
                    <input v-model="form.age" type="number" required :placeholder="$t('form.agePlaceholder')" :class="inputClass" />
                  </div>
                  <div class="space-y-2">
                    <label :class="labelClass">{{ $t('form.gender') }} <span class="text-primary">*</span></label>
                    <select v-model="form.gender" :class="selectClass">
                      <option value="Male">{{ $t('form.male') }}</option>
                      <option value="Female">{{ $t('form.female') }}</option>
                      <option value="Other">{{ $t('form.other') }}</option>
                    </select>
                  </div>
                </div>
                <div v-if="isEditMode" class="md:col-span-2 space-y-2">
                  <label :class="labelClass">{{ $t('register.statusLabel') }}</label>
                  <select v-model="form.status" :class="selectClass">
                    <option value="missing">{{ $t('filters.missing') }}</option>
                    <option value="found">{{ $t('filters.found') }}</option>
                    <option value="deceased">{{ $t('filters.deceased') }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="flex pt-6 justify-end gap-3">
              <Button
                v-if="isEditMode"
                :label="loading ? $t('form.submitting') : $t('form.save')"
                severity="secondary"
                icon="pi pi-save"
                iconPos="left"
                :loading="loading"
                :disabled="loading || !isFormValid"
                @click="handleSave"
              />
              <Button :label="$t('form.next')" icon="pi pi-arrow-right" iconPos="right" @click="handleNextStep1(activateCallback)" />
            </div>
          </StepPanel>

          <!-- Step 2: Physical Characteristics -->
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="space-y-6">
              <h4 class="text-lg font-bold text-secondary">{{ $t('detail.keyInfo') }} ({{ $t('form.optional') }})</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.height') }}</label>
                  <div class="flex gap-2">
                    <input v-model="form.height.value" type="number" step="0.01" :placeholder="$t('form.height')" :class="inputClass" />
                    <select v-model="form.height.unit" class="w-24 px-3 py-3 bg-background border border-border rounded-xl text-secondary">
                      <option value="cm">CM</option>
                      <option value="ft">FT</option>
                    </select>
                  </div>
                </div>
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.build') }}</label>
                  <select v-model="form.build" :class="selectClass">
                    <option value="" disabled>{{ $t('form.selectOption') }}</option>
                    <option v-for="type in buildTypes" :key="type" :value="type">{{ $t(`attributes.build.${type}`) }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.hairColor') }}</label>
                  <select v-model="form.hair.color" :class="selectClass">
                    <option value="" disabled>{{ $t('form.selectOption') }}</option>
                    <option v-for="color in hairColors" :key="color" :value="color">{{ $t(`attributes.hair.${color}`) }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.hairLength') }}</label>
                  <select v-model="form.hair.length" :class="selectClass">
                    <option value="" disabled>{{ $t('form.selectOption') }}</option>
                    <option v-for="length in hairLengths" :key="length" :value="length">{{ $t(`attributes.length.${length}`) }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.eyes') }}</label>
                  <select v-model="form.eyes" :class="selectClass">
                    <option value="" disabled>{{ $t('form.selectOption') }}</option>
                    <option v-for="color in eyeColors" :key="color" :value="color">{{ $t(`attributes.eyes.${color}`) }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button :label="$t('form.back')" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
              <div class="flex gap-3">
                <Button
                  v-if="isEditMode"
                  :label="loading ? $t('form.submitting') : $t('form.save')"
                  severity="secondary"
                  icon="pi pi-save"
                  iconPos="left"
                  :loading="loading"
                  :disabled="loading || !isFormValid"
                  @click="handleSave"
                />
                <Button :label="$t('form.next')" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
              </div>
            </div>
          </StepPanel>

          <!-- Step 3: Location & Circumstances -->
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="space-y-6">
              <LocationPicker @update:location="updateLocation" @update:coordinates="updateCoordinates" />
              <input type="hidden" v-model="form.lastSeenLocation" />
              <div class="space-y-2">
                <label :class="labelClass">{{ $t('missing.lastSeen') }} ({{ $t('report.dateTime') }}) <span class="text-primary">*</span></label>
                <VueDatePicker
                  v-model="form.lastSeenDate"
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
              <div class="space-y-2">
                <label :class="labelClass">{{ $t('form.description') }}</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  :placeholder="$t('form.descriptionPlaceholder')"
                  class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-secondary placeholder:text-light"
                ></textarea>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button :label="$t('form.back')" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
              <div class="flex gap-3">
                <Button
                  v-if="isEditMode"
                  :label="loading ? $t('form.submitting') : $t('form.save')"
                  severity="secondary"
                  icon="pi pi-save"
                  iconPos="left"
                  :loading="loading"
                  :disabled="loading || !isFormValid"
                  @click="handleSave"
                />
                <Button :label="$t('form.next')" icon="pi pi-arrow-right" iconPos="right" @click="handleNextStep3(activateCallback)" />
              </div>
            </div>
          </StepPanel>

          <!-- Step 4: Photos & Reward -->
          <StepPanel v-slot="{ activateCallback }" value="4">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.reward') }} ({{ $t('form.optional') }})</label>
                  <InputNumber
                    v-model="form.reward.amount"
                    mode="currency"
                    :currency="form.reward.currency || 'USD'"
                    :locale="currencyInputLocale"
                    :min="0"
                    :placeholder="$t('form.rewardPlaceholder')"
                    fluid
                    :input-class="inputClass"
                  />
                </div>
                <div class="space-y-2">
                  <label :class="labelClass">{{ $t('form.rewardCurrency') }}</label>
                  <select v-model="form.reward.currency" :class="selectClass">
                    <option value="">{{ $t('form.selectOption') }}</option>
                    <option v-for="code in rewardCurrencies" :key="code" :value="code">{{ $t('currencies.' + code) }}</option>
                  </select>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label :class="labelClass">{{ $t('form.photos') }}</label>
                  <span class="text-xs text-light">{{ totalPhotos }}/{{ uploadConstants.maxPhotosPerPost }}</span>
                </div>
                <div
                  class="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative"
                  :class="{ 'opacity-50 cursor-not-allowed': totalPhotos >= uploadConstants.maxPhotosPerPost }"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleFileUpload"
                    :disabled="totalPhotos >= uploadConstants.maxPhotosPerPost"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div class="space-y-2">
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <i class="pi pi-image text-2xl"></i>
                    </div>
                    <p class="text-secondary font-medium">{{ $t('form.clickToUpload') }}</p>
                    <p class="text-xs text-light">{{ $t('form.fileConstraints') }}</p>
                  </div>
                </div>
                <p v-if="photoError" class="text-sm text-red-500">{{ photoError }}</p>
                <div v-if="existingPhotoUrls.length > 0 || photoPreviews.length > 0" class="grid grid-cols-3 gap-4 mt-4">
                  <div
                    v-for="(url, index) in existingPhotoUrls"
                    :key="'existing-' + index"
                    class="relative group"
                  >
                    <img
                      :src="getPhotoUrl(url)"
                      :alt="'Photo ' + (index + 1)"
                      class="w-full h-24 object-cover rounded-lg shadow-sm"
                      @error="handleImageError"
                    />
                    <button
                      v-if="isEditMode"
                      type="button"
                      @click.prevent="removeExistingPhoto(index)"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                  <div v-for="(preview, index) in photoPreviews" :key="'new-' + index" class="relative group">
                    <img :src="preview" class="w-full h-24 object-cover rounded-lg shadow-sm" />
                    <button
                      type="button"
                      @click.prevent="removePhoto(index)"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button :label="$t('form.back')" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
              <Button
                type="submit"
                :label="loading ? $t('form.submitting') : $t('form.submit')"
                :loading="loading"
                :disabled="loading"
              />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </form>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmationModal"
      class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeConfirmationAndGoHome"
    >
      <div class="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white transform transition-all">
        <div class="flex justify-end mb-2">
          <button
            type="button"
            @click="closeConfirmationAndGoHome"
            class="text-light hover:text-secondary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="text-center">
          <div
            class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-secondary mb-3">{{ $t('register.successTitle') }}</h3>
          <p class="text-light mb-8">{{ $t('register.successMessage') }}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              @click="closeConfirmationAndViewProfile"
              class="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-[var(--color-primary-dark)] transition-all"
            >
              {{ $t('register.viewProfile') }}
            </button>
            <button
              type="button"
              @click="closeConfirmationAndGoHome"
              class="px-6 py-3 bg-surface text-secondary font-bold rounded-xl border-2 border-border hover:bg-background hover:border-[var(--color-secondary-light)] transition-all"
            >
              {{ $t('register.goHome') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
