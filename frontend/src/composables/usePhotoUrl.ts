import { apiBaseUrl } from '../services/api';
import { placeholderImageUrl } from '../constants/api.constants';

export function usePhotoUrl() {
  const getPhotoUrl = (photoPath?: string): string => {
    if (!photoPath) return placeholderImageUrl;
    if (photoPath.startsWith('http')) return photoPath;
    return `${apiBaseUrl}${photoPath}`;
  };

  const handleImageError = (event: Event): void => {
    const target = event.target as HTMLImageElement;
    target.src = placeholderImageUrl;
  };

  return { getPhotoUrl, handleImageError, placeholderImageUrl };
}
