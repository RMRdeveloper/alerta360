<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, onMounted, onUnmounted } from 'vue';

const { locale } = useI18n();
const isScrolled = ref(false);

const checkScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => window.addEventListener('scroll', checkScroll));
onUnmounted(() => window.removeEventListener('scroll', checkScroll));

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'es' : 'en';
};
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6']"
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
              { to: '/missing', label: 'nav.missing' },
              { to: '/register', label: 'nav.register' },
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

  <main class="min-h-screen pt-32 pb-12 px-6">
    <div class="max-w-7xl mx-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
