import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/missing',
      name: 'missing',
      component: () => import('../views/MissingPersonsView.vue'),
    },
    {
      path: '/missing/:id',
      name: 'missing-detail',
      component: () => import('../views/MissingPersonDetailView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterMissingView.vue'),
    },
    {
      path: '/report-sighting',
      name: 'report-sighting',
      component: () => import('../views/ReportSightingView.vue'),
    },
    {
      path: '/register-child',
      name: 'register-child',
      component: () => import('../views/RegisterChildView.vue'),
    },
    {
      path: '/risk-map',
      name: 'risk-map',
      component: () => import('../views/RiskMapView.vue'),
    },
  ],
});

export default router;
