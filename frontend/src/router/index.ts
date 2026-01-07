import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/HomeView.vue';
import MissingPersonsView from '../views/MissingPersonsView.vue';
import MissingPersonDetailView from '../views/MissingPersonDetailView.vue';
import RegisterMissingView from '../views/RegisterMissingView.vue';
import RegisterChildView from '../views/RegisterChildView.vue';
import ReportSightingView from '../views/ReportSightingView.vue';
import RiskMapView from '../views/RiskMapView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/missing-persons',
      name: 'missing-persons',
      component: MissingPersonsView,
    },
    {
      path: '/missing-persons/:id',
      name: 'missing-person-detail',
      component: MissingPersonDetailView,
    },
    {
      path: '/register-missing',
      name: 'register-missing',
      component: RegisterMissingView,
    },
    {
      path: '/register-child',
      name: 'register-child',
      component: RegisterChildView,
    },
    {
      path: '/report-sighting',
      name: 'report-sighting',
      component: ReportSightingView,
    },
    {
      path: '/risk-map',
      name: 'risk-map',
      component: RiskMapView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { layout: 'auth', guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { layout: 'auth', guestOnly: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Check for guest-only routes (login, register)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' }); // Redirect authenticated users to home
  } else {
    next();
  }
});

export default router;
