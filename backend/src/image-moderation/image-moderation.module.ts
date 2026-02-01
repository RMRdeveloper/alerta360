import { Module } from '@nestjs/common';
import { ImageModerationService } from './image-moderation.service';
import { ImageModerationController } from './image-moderation.controller';

@Module({
  controllers: [ImageModerationController],
  providers: [ImageModerationService],
  exports: [ImageModerationService],
})
export class ImageModerationModule {}
