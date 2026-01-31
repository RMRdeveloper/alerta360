import axios from 'axios';
import { imageModerationErrorCode } from '../constants/api.constants';

/**
 * Determines if an error is a 400 response due to image moderation (adult content) rejection.
 */
export function isModerationRejection(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status !== 400) return false;
  const errorCode = error.response?.data?.errorCode;
  return errorCode === imageModerationErrorCode;
}

/**
 * Returns the rejection message from the API when present, otherwise undefined.
 */
export function getModerationMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const message = error.response?.data?.message;
  return typeof message === 'string' ? message : undefined;
}
