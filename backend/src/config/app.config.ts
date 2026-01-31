export const paginationConfig = {
  defaultPageSize: 15,
  maxPageSize: 100,
};

export const uploadConfig = {
  maxPhotosPerPost: 5,
};

export const moderationConfig = {
  enabled: process.env.IMAGE_MODERATION_ENABLED !== 'false',
  threshold: 0.5,
};

export const imageModerationErrorCode = 'IMAGE_MODERATION_REJECTED' as const;

export const moderationMessages = {
  multipleImagesRejected:
    'Una o más imágenes contienen contenido no permitido.',
  singleImageRejected: 'La imagen contiene contenido no permitido.',
} as const;

export const nsfwRejectLabels: readonly string[] = ['Porn', 'Hentai'];

export const rewardCurrencies = [
  'USD',
  'EUR',
  'MXN',
  'COP',
  'PEN',
  'DOP',
] as const;
