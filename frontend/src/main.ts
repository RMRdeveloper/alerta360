import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import '@vuepic/vue-datepicker/dist/main.css';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { useAuthStore } from './stores/auth';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);

// Check authentication status before mounting (optional: await it if you want to block rendering)
const authStore = useAuthStore();
authStore.checkAuth().finally(() => {
  app.mount('#app');
});
