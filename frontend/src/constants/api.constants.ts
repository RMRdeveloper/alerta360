export const placeholderImageUrl =
  'https://placehold.co/600x800/2d3436/ffffff?text=No+Image';

export const apiRoutes = {
  missingPersons: '/missing-persons',
  missingPersonById: (id: string) => `/missing-persons/${id}`,
  sightings: '/sightings',
  sightingsByPersonId: (id: string) => `/sightings/person/${id}`,
  authProfile: '/auth/profile',
  authGoogle: '/auth/google',
  glossary: '/glossary',
} as const;

export const paginationConstants = {
  defaultPageSize: 15,
  pageSizeOptions: [15, 30, 45],
  mapPageSize: 100,
} as const;

export const uploadConstants = {
  maxPhotosPerPost: 5,
} as const;

export const imageModerationErrorCode = 'IMAGE_MODERATION_REJECTED' as const;
