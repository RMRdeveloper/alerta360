import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IImageModerationService } from './image-moderation.interface';
import { moderationConfig, nsfwRejectLabels } from '../config/app.config';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';
import * as sharp from 'sharp';

const modelInputSize = 224;

@Injectable()
export class ImageModerationService
  implements IImageModerationService, OnModuleInit
{
  private readonly logger = new Logger(ImageModerationService.name);
  private model: nsfwjs.NSFWJS | null = null;

  async onModuleInit(): Promise<void> {
    if (!moderationConfig.enabled) {
      this.logger.log('Image moderation disabled, bypassing NSFW check');
      return;
    }
    try {
      tf.enableProdMode();
      this.model = await nsfwjs.load();
      this.logger.log('NSFW.js model loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load NSFW.js model', error);
      throw error;
    }
  }

  async isImageSafe(file: Express.Multer.File): Promise<boolean> {
    if (!moderationConfig.enabled) {
      return true;
    }
    if (!this.model) {
      this.logger.warn('Model not loaded, rejecting image (fail-closed)');
      return false;
    }
    let tensor: tf.Tensor3D | null = null;
    try {
      tensor = await this.bufferToTensor(file.buffer);
      const predictions = await this.model.classify(tensor);
      const isSafe = this.evaluatePredictions(predictions);
      if (!isSafe) {
        this.logger.debug(`Image rejected: ${JSON.stringify(predictions)}`);
      }
      return isSafe;
    } catch (error) {
      this.logger.error('Image moderation failed', error);
      return false;
    } finally {
      if (tensor) {
        tensor.dispose();
      }
    }
  }

  /**
   * Convierte un buffer de imagen a tensor 3D (height, width, 3 canales RGB)
   * para la clasificación NSFW. Normaliza canales (grayscale → RGB, RGBA → RGB).
   */
  private async bufferToTensor(buffer: Buffer): Promise<tf.Tensor3D> {
    const { data, info } = await sharp(buffer)
      .resize(modelInputSize, modelInputSize)
      .raw()
      .toBuffer({ resolveWithObject: true });

    let rgbData: Uint8Array;
    if (info.channels === 1) {
      rgbData = new Uint8Array(info.width * info.height * 3);
      for (
        let pixelIndex = 0;
        pixelIndex < info.width * info.height;
        pixelIndex++
      ) {
        const grayValue = data[pixelIndex];
        rgbData[pixelIndex * 3] = grayValue;
        rgbData[pixelIndex * 3 + 1] = grayValue;
        rgbData[pixelIndex * 3 + 2] = grayValue;
      }
    } else if (info.channels === 4) {
      rgbData = new Uint8Array(info.width * info.height * 3);
      for (
        let pixelIndex = 0;
        pixelIndex < info.width * info.height;
        pixelIndex++
      ) {
        rgbData[pixelIndex * 3] = data[pixelIndex * 4];
        rgbData[pixelIndex * 3 + 1] = data[pixelIndex * 4 + 1];
        rgbData[pixelIndex * 3 + 2] = data[pixelIndex * 4 + 2];
      }
    } else {
      rgbData = new Uint8Array(data);
    }

    return tf.tensor3d(rgbData, [info.height, info.width, 3]);
  }

  /**
   * Evalúa si las predicciones indican contenido no seguro (Porn/Hentai).
   * @returns false si alguna predicción supera el umbral, true si es segura.
   */
  private evaluatePredictions(
    predictions: Array<{ className: string; probability: number }>,
  ): boolean {
    const threshold = moderationConfig.threshold;
    for (const prediction of predictions) {
      if (
        nsfwRejectLabels.includes(prediction.className) &&
        prediction.probability >= threshold
      ) {
        return false;
      }
    }
    return true;
  }
}
