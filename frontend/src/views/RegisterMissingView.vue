<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';

const router = useRouter();
const { t } = useI18n();

const form = ref({
  name: '',
  age: null,
  gender: 'Male',
  lastSeenLocation: '',
  lastSeenDate: '',
  description: '',
  reporterId: 'guest-user',
  coordinates: null as { type: string; coordinates: number[] } | null,
  height: { value: null as number | null, unit: 'cm' },
  hair: { color: '', length: '' },
  eyes: '',
  build: '',
});

const hairColors = ['black', 'brown', 'blonde', 'red', 'gray', 'bald', 'other'];
const hairLengths = ['short', 'medium', 'long', 'bald'];
const eyeColors = ['brown', 'blue', 'green', 'hazel', 'gray', 'other'];
const buildTypes = ['slender', 'athletic', 'average', 'heavy', 'obese'];

const photoFiles = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);
const loading = ref(false);

const updateLocation = (address: string) => {
  form.value.lastSeenLocation = address;
};

const updateCoordinates = (coords: { type: string; coordinates: number[] }) => {
  form.value.coordinates = coords;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    photoFiles.value = [...photoFiles.value, ...files];
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          photoPreviews.value.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const removePhoto = (index: number) => {
  photoFiles.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

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
    formData.append('reporterId', form.value.reporterId);
    
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

    photoFiles.value.forEach(file => {
      formData.append('photos', file);
    });

    await api.post('/missing-persons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    router.push('/');
  } catch (error) {
    console.error(error);
    alert(t('errors.registerFailed'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-secondary mb-3">{{ $t('nav.register') }}</h1>
      <p class="text-light text-lg">{{ $t('register.subtitle') }}</p>
    </div>
    
    <form @submit.prevent="submitForm" class="bg-surface rounded-3xl shadow-xl shadow-gray-100 border border-white p-8 md:p-10 space-y-8">
      <!-- Personal Info Section -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-secondary flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
          {{ $t('register.step1') }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.name') }} <span class="text-primary">*</span></label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              :placeholder="$t('form.fullNamePlaceholder')"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-secondary">{{ $t('form.age') }} <span class="text-primary">*</span></label>
              <input 
                v-model="form.age" 
                type="number" 
                required 
                :placeholder="$t('form.agePlaceholder')"
                class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-secondary">{{ $t('form.gender') }} <span class="text-primary">*</span></label>
              <select 
                v-model="form.gender"
                class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="Male">{{ $t('form.male') }}</option>
                <option value="Female">{{ $t('form.female') }}</option>
                <option value="Other">{{ $t('form.other') }}</option>
              </select>
            </div>
          </div>
        </div>

        <h4 class="text-lg font-bold text-secondary mt-6 mb-4">{{ $t('detail.keyInfo') }} ({{ $t('form.optional') }})</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.height') }}</label>
            <div class="flex gap-2">
              <input 
                v-model="form.height.value" 
                type="number" 
                step="0.01"
                :placeholder="$t('form.height')"
                class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <select 
                v-model="form.height.unit"
                class="w-24 px-3 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="cm">CM</option>
                <option value="ft">FT</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.build') }}</label>
            <select 
              v-model="form.build"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            >
              <option value="" disabled>{{ $t('form.selectOption') }}</option>
              <option v-for="type in buildTypes" :key="type" :value="type">{{ $t(`attributes.build.${type}`) }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.hairColor') }}</label>
            <select 
              v-model="form.hair.color"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            >
              <option value="" disabled>{{ $t('form.selectOption') }}</option>
              <option v-for="color in hairColors" :key="color" :value="color">{{ $t(`attributes.hair.${color}`) }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.hairLength') }}</label>
            <select 
              v-model="form.hair.length"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            >
              <option value="" disabled>{{ $t('form.selectOption') }}</option>
              <option v-for="length in hairLengths" :key="length" :value="length">{{ $t(`attributes.length.${length}`) }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.eyes') }}</label>
            <select 
              v-model="form.eyes"
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            >
              <option value="" disabled>{{ $t('form.selectOption') }}</option>
              <option v-for="color in eyeColors" :key="color" :value="color">{{ $t(`attributes.eyes.${color}`) }}</option>
            </select>
          </div>
        </div>
      </div>

      <hr class="border-border/50" />

      <!-- Disappearance Details -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-secondary flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
          {{ $t('register.step2') }}
        </h3>

        <div class="space-y-4">
          <!-- Location Picker Component -->
          <LocationPicker 
            @update:location="updateLocation"
            @update:coordinates="updateCoordinates"
          />
          
          <input type="hidden" v-model="form.lastSeenLocation" required />

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('missing.lastSeen') }} ({{ $t('report.dateTime') }}) <span class="text-primary">*</span></label>
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
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-secondary">{{ $t('form.description') }}</label>
          <textarea 
            v-model="form.description" 
            rows="4"
            :placeholder="$t('form.descriptionPlaceholder')"
            class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          ></textarea>
        </div>

        <!-- Photo Upload Section -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-secondary">{{ $t('form.photos') }}</label>
          <div 
            class="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative"
          >
            <input 
              type="file" 
              accept="image/*" 
              multiple
              @change="handleFileUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            <div class="space-y-2">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-secondary font-medium">{{ $t('form.clickToUpload') }}</p>
              <p class="text-xs text-light">{{ $t('form.fileConstraints') }}</p>
            </div>
          </div>

          <!-- Previews -->
          <div v-if="photoPreviews.length > 0" class="grid grid-cols-3 gap-4 mt-4">
            <div v-for="(preview, index) in photoPreviews" :key="index" class="relative group">
              <img :src="preview" class="w-full h-24 object-cover rounded-lg shadow-sm" />
              <button 
                @click.prevent="removePhoto(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                &times;
              </button>
            </div>
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
