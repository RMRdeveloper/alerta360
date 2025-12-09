<script setup lang="ts">
import { ref } from 'vue';

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);

const handleRegister = () => {
  // UI only
  console.log('Register attempt:', { fullName: fullName.value, email: email.value });
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 py-12">
    <!-- Background Decor Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div class="absolute bottom-[10%] left-[5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div class="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl opacity-60"></div>
    </div>

    <!-- Register Card -->
    <div class="relative z-10 w-full max-w-md px-6">
      <div class="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <router-link to="/" class="inline-flex justify-center mb-4">
            <div class="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary/30 transform transition-transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </router-link>
          <h1 class="text-3xl font-bold text-secondary tracking-tight mb-2">
            {{ $t('auth.createAccount') }}
          </h1>
          <p class="text-gray-500">
            {{ $t('auth.joinCommunity') }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          
          <!-- Full Name -->
          <div class="space-y-1">
            <label for="fullName" class="block text-sm font-semibold text-secondary ml-1">{{ $t('auth.fullName') }}</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input 
                id="fullName" 
                v-model="fullName" 
                type="text" 
                required
                class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.fullNamePlaceholder')"
              >
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-1">
            <label for="email" class="block text-sm font-semibold text-secondary ml-1">{{ $t('auth.email') }}</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                autocomplete="email" 
                required
                class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.emailPlaceholder')"
              >
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <label for="password" class="block text-sm font-semibold text-secondary ml-1">{{ $t('auth.password') }}</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                class="block w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.passwordPlaceholder')"
              >
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors focus:outline-none"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-1">
            <label for="confirmPassword" class="block text-sm font-semibold text-secondary ml-1">{{ $t('auth.confirmPassword') }}</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input 
                id="confirmPassword" 
                v-model="confirmPassword" 
                :type="showPassword ? 'text' : 'password'" 
                required
                class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.confirmPasswordPlaceholder')"
              >
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full relative overflow-hidden group bg-primary-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span class="relative z-10 flex items-center justify-center gap-2">
              {{ $t('auth.registerButton') }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </button>

          <!-- Footer -->
          <div class="text-center text-sm text-gray-500 mt-6">
            {{ $t('auth.haveAccount') }}
            <router-link to="/login" class="font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 group">
              {{ $t('auth.loginLink') }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </form>
      </div>
      
      <!-- Bottom Links -->
      <div class="mt-8 text-center">
        <router-link to="/" class="text-sm font-medium text-gray-400 hover:text-secondary transition-colors inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('auth.backToHome') }}
        </router-link>
      </div>
    </div>
  </div>
</template>
