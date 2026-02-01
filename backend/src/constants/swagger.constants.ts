/**
 * Shared Swagger/API descriptions used across multiple modules.
 * Per AGENTS.md section 8: avoid magic strings, centralize repeated values.
 */
export const swaggerDescriptions = {
  unauthorized: 'Unauthorized.',
  invalidInput: 'Invalid input.',
  missingPersonNotFound: 'Missing person not found.',
  healthCheckOk: 'Health check OK.',
  applicationStatistics: 'Application statistics.',
} as const;
