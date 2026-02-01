export const imageModerationSwaggerDescriptions = {
  checkSummary: 'Check image for adult content',
  checkDescription:
    'Validates an image for adult/inappropriate content. Use this before submitting images to missing-persons or sightings endpoints.',
  imageFileToValidate: 'Image file to validate',
  moderationResult: 'Moderation result.',
  noFileOrInvalidRequest: 'No file provided or invalid request.',
} as const;
