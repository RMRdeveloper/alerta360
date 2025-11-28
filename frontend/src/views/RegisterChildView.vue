<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const form = ref({
  name: '',
  age: null,
  photos: [],
  parentContact: '',
});

const loading = ref(false);

const submitForm = async () => {
  loading.value = true;
  try {
    await api.post('/children', form.value);
    alert('Child registered successfully! Data is safe.');
    router.push('/');
  } catch (error) {
    console.error('Error registering child:', error);
    alert('Failed to register.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-secondary mb-3">{{ $t('nav.registerChild') }}</h1>
      <p class="text-light text-lg max-w-2xl mx-auto">
        {{ $t('child.subtitle') }}
      </p>
    </div>
    
    <form @submit.prevent="submitForm" class="bg-surface rounded-3xl shadow-xl shadow-gray-100 border border-white p-8 md:p-10 space-y-8 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.name') }}</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-secondary">{{ $t('form.age') }}</label>
            <input 
              v-model="form.age" 
              type="number" 
              required 
              class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-secondary">{{ $t('child.parentContact') }}</label>
          <input 
            v-model="form.parentContact" 
            type="text" 
            required 
            :placeholder="$t('child.emergencyPhone')"
            class="w-full px-5 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      <div class="pt-4">
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {{ loading ? $t('child.submitting') : $t('child.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>
