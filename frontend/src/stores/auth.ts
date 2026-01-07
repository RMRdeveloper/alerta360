import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  async function checkAuth() {
    try {
      const response = await api.get('/auth/profile');
      user.value = response.data;
      return true;
    } catch (error) {
      user.value = null;
      return false;
    }
  }

  async function login(credentials: any) {
    try {
      const response = await api.post('/auth/login', credentials);
      user.value = response.data.user;
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async function register(userData: any) {
    try {
      const response = await api.post('/auth/register', userData);
      user.value = response.data.user;
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
      user.value = null;
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  return { user, isAuthenticated, checkAuth, login, register, logout };
});
