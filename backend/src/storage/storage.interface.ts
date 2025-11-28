import { Express } from 'express';

export interface IStorageService {
  uploadFile(file: Express.Multer.File): Promise<string>;
}

export const IStorageService = Symbol('IStorageService');
