import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SightingsController } from './sightings.controller';
import { SightingsService } from './sightings.service';
import { Sighting, SightingSchema } from './schemas/sighting.schema';
import { StorageModule } from '../storage/storage.module';
import { ImageModerationModule } from '../image-moderation/image-moderation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sighting.name, schema: SightingSchema },
    ]),
    StorageModule,
    ImageModerationModule,
  ],
  controllers: [SightingsController],
  providers: [SightingsService],
  exports: [SightingsService],
})
export class SightingsModule {}
