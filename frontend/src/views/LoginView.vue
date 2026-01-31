<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// State
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

// Dependencies
const authStore = useAuthStore();
const router = useRouter();

// Constants (DRY/KISS)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Handlers
const handleLogin = async () => {
  try {
    errorMessage.value = '';
    await authStore.login({ email: email.value, password: password.value });
    const returnUrl = (router.currentRoute.value.query.returnUrl as string) || '/';
    router.push(returnUrl);
  } catch (error) {
    errorMessage.value = 'Invalid credentials. Please try again.';
  }
};

const handleGoogleLogin = () => {
  // Delegate OAuth flow to backend
  window.location.href = `${BACKEND_URL}/auth/google`;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
    <!-- Background Decor Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl opacity-60"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md px-6">
      <div class="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <router-link to="/" class="inline-flex justify-center mb-4" tabindex="-1">
            <div class="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary/30 transform transition-transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </router-link>
          <h1 class="text-3xl font-bold text-secondary tracking-tight mb-2">
            {{ $t('auth.welcomeBack') }}
          </h1>
          <p class="text-gray-500">
            {{ $t('auth.loginSubtitle') }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <!-- Error Feedback -->
          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
            {{ errorMessage }}
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
                autofocus
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
                autocomplete="current-password"
                required
                class="block w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.passwordPlaceholder')"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors focus:outline-none"
                tabindex="-1"
              >
                <!-- tabindex -1 to skip toggle button in normal flow, keeps focus on fields -->
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <!-- Forgot Password moved here for better tab flow -->
            <div class="flex justify-end pt-1">
              <a href="#" class="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">{{ $t('auth.forgotPassword') }}</a>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full relative overflow-hidden group bg-primary-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span class="relative z-10 flex items-center justify-center gap-2">
              {{ $t('auth.loginButton') }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>

          <!-- Divider -->
          <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 text-sm">{{ $t('auth.orContinueWith') }}</span>
            <div class="flex-grow border-t border-gray-200"></div>
          </div>

          <!-- Google Button -->
          <button
            type="button"
            @click="handleGoogleLogin"
            class="w-full relative overflow-hidden group bg-white border border-gray-200 text-secondary font-semibold py-3.5 rounded-xl shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]"
          >
            <span class="flex items-center justify-center gap-3">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.8055 10.0415C21.829 10.6585 21.8055 11.2325 21.7115 11.7515C21.3655 13.7845 20.4285 15.6885 18.9865 17.1685C17.5145 18.6785 15.4325 19.6105 12.9805 19.6105C9.0765 19.6105 5.6765 17.1525 4.3055 13.6825C3.9665 12.8225 3.7785 11.8965 3.7785 10.9205C3.7785 9.9445 3.9665 9.0185 4.3055 8.1585C5.6765 4.6885 9.0765 2.2305 12.9805 2.2305C15.2285 2.2305 17.2025 3.0035 18.7845 4.3055L15.9085 7.1815C15.1565 6.4765 14.1225 6.0535 12.9805 6.0535C10.2285 6.0535 7.8465 7.8685 6.9425 10.4285C6.7305 11.0865 6.7305 11.8025 6.9425 12.4605C7.8465 15.0205 10.2285 16.8355 12.9805 16.8355C14.1785 16.8355 15.2605 16.5175 16.1425 15.9765C17.2005 15.3185 17.8465 14.2365 18.0465 13.0495H12.9805V10.0415H21.8055Z" fill="#FFC107"/>     
                <path d="M3.19238 10.5195L5.78338 12.4845C5.07438 14.2885 3.65138 15.7225 1.83838 16.4255L0.270381 15.2225C0.0383809 15.0335 -0.0636191 14.7335 0.0303809 14.4715C0.347381 13.5785 0.812381 12.7505 1.39638 12.0165C1.88438 11.3975 2.48838 10.8875 3.19238 10.5195Z" fill="#FF3D00"/>
                <path d="M12.9802 19.6106C10.6082 19.6106 8.44419 18.7906 6.78619 17.4196L7.96519 14.7176C9.07019 15.9386 10.8752 16.8356 12.9802 16.8356C16.3262 16.8356 19.1432 14.5426 20.1232 11.4596L22.9562 12.4276C21.8612 16.3276 17.9232 19.6106 12.9802 19.6106Z" fill="#4CAF50"/>
                <path d="M22.9566 9.42349L20.2546 10.3755C19.9576 8.35649 18.7306 6.57849 17.0266 5.41849L18.4716 2.85849C18.8476 3.17949 19.2006 3.52849 19.5266 3.90349C21.0546 5.51849 22.1816 7.42349 22.9566 9.42349Z" fill="#1976D2"/>
              </svg>
              Google
            </span>
          </button>

          <!-- Footer -->
          <div class="text-center text-sm text-gray-500 mt-6">
            {{ $t('auth.noAccount') }}
            <router-link to="/register" class="font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 group">
              {{ $t('auth.registerLink') }}
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
