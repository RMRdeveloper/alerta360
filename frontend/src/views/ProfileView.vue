<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const firstName = ref('');
const lastName = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const userInitials = computed(() => {
  if (!user.value) return 'U';
  const first = user.value.firstName?.charAt(0) || '';
  const last = user.value.lastName?.charAt(0) || '';
  return (
    (first + last).toUpperCase() ||
    user.value.email?.charAt(0).toUpperCase() ||
    'U'
  );
});

const displayName = computed(() => {
  if (!user.value) return '';
  const first = user.value.firstName?.trim();
  const last = user.value.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(' ');
  return user.value.email?.split('@')[0] || '';
});

onMounted(() => {
  if (user.value) {
    firstName.value = user.value.firstName ?? '';
    lastName.value = user.value.lastName ?? '';
  }
});

const handleSave = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await authStore.updateProfile({
      firstName: firstName.value.trim() || undefined,
      lastName: lastName.value.trim() || undefined,
    });
    successMessage.value = 'profile.saved';
  } catch (err) {
    errorMessage.value = 'profile.saveError';
    console.error('Profile update failed', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <!-- Profile header -->
      <div
        class="bg-primary-gradient px-6 py-8 flex flex-col sm:flex-row items-center gap-6"
      >
        <div
          v-if="user?.avatar"
          class="w-24 h-24 rounded-full overflow-hidden border-4 border-white/50 shadow-xl shrink-0"
        >
          <img
            :src="user.avatar"
            :alt="displayName"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-24 h-24 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold border-4 border-white/50 shadow-xl shrink-0"
        >
          {{ userInitials }}
        </div>
        <div class="text-center sm:text-left">
          <h1 class="text-2xl font-bold text-white">
            {{ displayName || $t('profile.title') }}
          </h1>
          <p class="text-white/90 mt-1">{{ user?.email }}</p>
        </div>
      </div>

      <!-- Form section -->
      <div class="p-6 md:p-8">
        <h2 class="text-lg font-semibold text-secondary mb-4">
          {{ $t('profile.subtitle') }}
        </h2>

        <form @submit.prevent="handleSave" class="space-y-5">
          <div v-if="successMessage" class="p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl text-center">
            {{ $t(successMessage) }}
          </div>
          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
            {{ $t(errorMessage) }}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label
                for="profile-firstName"
                class="block text-sm font-semibold text-secondary ml-1"
              >
                {{ $t('auth.firstName') }}
              </label>
              <input
                id="profile-firstName"
                v-model="firstName"
                type="text"
                class="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.firstNamePlaceholder')"
              />
            </div>
            <div class="space-y-1">
              <label
                for="profile-lastName"
                class="block text-sm font-semibold text-secondary ml-1"
              >
                {{ $t('auth.lastName') }}
              </label>
              <input
                id="profile-lastName"
                v-model="lastName"
                type="text"
                class="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
                :placeholder="$t('auth.lastNamePlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-sm font-semibold text-secondary ml-1">
              {{ $t('auth.email') }}
            </label>
            <input
              :value="user?.email"
              type="email"
              disabled
              class="block w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
            />
            <p class="text-xs text-gray-400 mt-1 ml-1">
              {{ $t('profile.emailCannotChange') }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-primary-gradient shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {{ isSubmitting ? $t('profile.saving') : $t('profile.save') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
