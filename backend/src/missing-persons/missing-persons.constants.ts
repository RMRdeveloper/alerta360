import { uploadConfig } from '../config/app.config';

export const missingPersonsMessages = {
  notFound: 'Missing person not found',
  onlyAuthorCanEdit: 'Only the author can edit this publication',
  onlyAuthorCanDelete: 'Only the author can delete this publication',
  getMaxPhotosExceeded: () =>
    `Maximum ${uploadConfig.maxPhotosPerPost} photos allowed per post`,
} as const;

export const missingPersonsSwaggerDescriptions = {
  registerData: 'Missing person registration data',
  registeredSuccess: 'The missing person has been successfully registered.',
  paginatedList: 'Paginated list of missing persons.',
  details: 'The missing person details.',
  fieldsToUpdate: 'Fields to update',
  updatedSuccess: 'The missing person has been successfully updated.',
  deletedSuccess: 'The missing person has been successfully deleted.',
} as const;
