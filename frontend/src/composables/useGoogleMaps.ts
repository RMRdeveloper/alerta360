let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export function useGoogleMaps() {
  const loadScript = (apiKey: string): Promise<void> => {
    if (isLoaded) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=__gmapsCallback`;
      script.async = true;
      script.defer = true;

      (window as any).__gmapsCallback = () => {
        delete (window as any).__gmapsCallback;
        isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        loadPromise = null;
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });

    return loadPromise;
  };

  return { loadScript };
}
