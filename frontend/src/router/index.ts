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
import ProfileView from '../views/ProfileView.vue';
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
      path: '/missing-persons/:id/edit',
      name: 'edit-missing',
      component: RegisterMissingView,
      meta: { requiresAuth: true },
    },
    {
      path: '/register-missing',
      name: 'register-missing',
      component: RegisterMissingView,
      meta: { requiresAuth: true },
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
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    const isAuth = await authStore.checkAuth();
    if (!isAuth) {
      next({ name: 'login', query: { returnUrl: to.fullPath } });
      return;
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
