import { ref } from 'vue';

export interface GeolocationState {
  coords: {
    latitude: number;
    longitude: number;
  } | null;
  timestamp: number | null;
}

export function useGeolocation(options: PositionOptions = {}) {
  const loading = ref(false);
  const error = ref<GeolocationPositionError | Error | null>(null);
  const coords = ref<GeolocationState['coords']>(null);

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    loading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation is not supported');
        error.value = err;
        loading.value = false;
        reject(err);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          coords.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          loading.value = false;
          resolve(position);
        },
        (err) => {
          error.value = err;
          loading.value = false;
          reject(err);
        },
        defaultOptions
      );
    });
  };

  return {
    coords,
    error,
    loading,
    getCurrentPosition,
  };
}
