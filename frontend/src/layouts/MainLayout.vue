<script setup lang="ts">
import AppNavbar from '../components/AppNavbar.vue';
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />
    <main class="min-h-screen pt-32 pb-12 px-6">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
