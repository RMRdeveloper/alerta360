<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

const route = useRoute();

const layout = computed(() => {
  if (route.meta.layout === 'auth') {
    return AuthLayout;
  }
  return MainLayout;
});
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
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
