import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import { apiRoutes } from '../constants/api.constants';
import type { GlossaryResponse } from '../types';

export function useGlossary() {
  const { locale } = useI18n();
  const categories = ref<GlossaryResponse['categories']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchGlossary() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<GlossaryResponse>(apiRoutes.glossary, {
        params: { locale: locale.value },
      });
      categories.value = data.categories;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      loading.value = false;
    }
  }

  onMounted(fetchGlossary);

  return { categories, loading, error, refetch: fetchGlossary };
}
