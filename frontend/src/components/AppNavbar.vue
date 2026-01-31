<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';
import { routePaths } from '../constants/routes.constants';

const { locale } = useI18n();
const isScrolled = ref(false);
const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const isProfileOpen = ref(false);

const checkScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Close dropdown when clicking outside
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.profile-menu')) {
    isProfileOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
  window.removeEventListener('click', closeDropdown);
});

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'es' : 'en';
};

const handleLogout = () => {
  authStore.logout();
  isProfileOpen.value = false;
};

const userInitials = computed(() => {
  if (!user.value) return 'U';
  const first = user.value.firstName?.charAt(0) || '';
  const last = user.value.lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || user.value.email?.charAt(0).toUpperCase() || 'U';
});

const displayName = computed(() => {
  if (user.value?.firstName) {
    return user.value.firstName;
  }
  // Fallback to email username if no name
  return user.value?.email?.split('@')[0] || 'User';
});
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-surface/80 backdrop-blur-xl"
    :class="[isScrolled ? 'shadow-lg py-3' : 'py-4']"
  >
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">     
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span class="text-2xl font-bold text-secondary tracking-tight">
            Alerta<span class="text-primary">360</span>
          </span>
        </router-link>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-1 bg-surface/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-border/50 shadow-sm">
          <router-link
            v-for="link in [
              { to: '/', label: 'nav.home' },
              { to: '/missing-persons', label: 'nav.missing' },
              { to: '/register-missing', label: 'nav.register' },
              { to: '/report-sighting', label: 'nav.report' },
              { to: '/register-child', label: 'nav.registerChild' },
              { to: '/risk-map', label: 'nav.riskMap' }
            ]"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 rounded-full text-sm font-medium text-light transition-all duration-300 hover:text-primary"
            active-class="bg-white text-primary shadow-sm"
          >
            {{ $t(link.label) }}
          </router-link>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <!-- Login Button (Only if NOT authenticated) -->
          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-primary/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />   
            </svg>
            {{ $t('nav.login') }}
          </router-link>

          <!-- User Profile Menu (Only if authenticated) -->
          <div v-else class="relative profile-menu">
            <button 
              @click.stop="isProfileOpen = !isProfileOpen"
              class="flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-gray-200 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div v-if="user?.avatar" class="w-8 h-8 rounded-full overflow-hidden border border-gray-100">
                <img :src="user.avatar" alt="Avatar" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                {{ userInitials }}
              </div>
              <!-- Display Name: First Name only -->
              <span class="text-sm font-semibold text-secondary px-1 hidden lg:block">{{ displayName }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 transition-transform duration-200" :class="{'rotate-180': isProfileOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <div 
              v-if="isProfileOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden transform origin-top-right transition-all animate-fade-in-down"
            >
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-xs text-gray-500">{{ $t('profile.signedInAs') }}</p>
                <p class="text-sm font-bold text-secondary truncate">{{ user?.email }}</p>
              </div>
              
              <router-link
                :to="routePaths.profile"
                @click="isProfileOpen = false"
                class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
              >
                {{ $t('profile.settings') }}
              </router-link>
              <div class="border-t border-gray-50 my-1"></div>
              <button 
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {{ $t('profile.signOut') }}
              </button>
            </div>
          </div>

          <!-- Language Switcher -->
          <button
            @click="toggleLanguage"
            class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-sm font-bold text-secondary hover:border-primary hover:text-primary transition-colors bg-surface"
          >
            {{ locale === 'en' ? 'ES' : 'EN' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
