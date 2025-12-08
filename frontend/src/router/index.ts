import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MissingPersonsView from '../views/MissingPersonsView.vue';
import MissingPersonDetailView from '../views/MissingPersonDetailView.vue';
import RegisterMissingView from '../views/RegisterMissingView.vue';
import RegisterChildView from '../views/RegisterChildView.vue';
import ReportSightingView from '../views/ReportSightingView.vue';
import RiskMapView from '../views/RiskMapView.vue';

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
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
});

export default router;
