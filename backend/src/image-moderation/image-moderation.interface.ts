import { Express } from 'express';

export interface IImageModerationService {
  /**
   * Evalúa si una imagen es apropiada (sin contenido adulto/desnudos).
   * @returns true si la imagen es segura, false si debe rechazarse.
   */
  isImageSafe(file: Express.Multer.File): Promise<boolean>;
}

export const IImageModerationService = Symbol('IImageModerationService');
