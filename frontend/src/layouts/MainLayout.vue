<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNavbar from '../components/AppNavbar.vue';
import HelpButton from '../components/HelpButton.vue';

const route = useRoute();
const showHelpButton = computed(() => route.path !== '/glossary');
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />
    <main class="min-h-screen pt-32 pb-12 px-6">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
    <HelpButton v-if="showHelpButton" />
  </div>
</template>
