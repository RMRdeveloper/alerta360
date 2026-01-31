import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SightingsService } from './sightings.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { SightingResponseDto } from './dto/sighting-response.dto';
import { IStorageService } from '../storage/storage.interface';
import {
  moderationMessages,
  imageModerationErrorCode,
} from '../config/app.config';
import { ImageModerationService } from '../image-moderation/image-moderation.service';
import { Express } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('sightings')
@Controller('sightings')
export class SightingsController {
  constructor(
    private readonly sightingsService: SightingsService,
    @Inject(IStorageService) private readonly storageService: IStorageService,
    private readonly imageModerationService: ImageModerationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Report a sighting' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Sighting report data',
    type: CreateSightingDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The sighting has been successfully reported.',
  })
  @ApiResponse({
    status: 400,
    description: moderationMessages.singleImageRejected,
  })
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createSightingDto: CreateSightingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const safe = await this.imageModerationService.isImageSafe(file);
      if (!safe) {
        throw new BadRequestException({
          message: moderationMessages.singleImageRejected,
          errorCode: imageModerationErrorCode,
        });
      }
      const photoUrl = await this.storageService.uploadFile(file);
      createSightingDto.photo = photoUrl;
    }
    return this.sightingsService.create(createSightingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sightings' })
  @ApiResponse({
    status: 200,
    description: 'List of all sightings.',
    type: [SightingResponseDto],
  })
  findAll() {
    return this.sightingsService.findAll();
  }

  @Get('person/:id')
  @ApiOperation({ summary: 'Get sightings for a specific missing person' })
  @ApiResponse({
    status: 200,
    description: 'List of sightings for the missing person.',
    type: [SightingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Missing person not found.' })
  findByMissingPerson(@Param('id') id: string) {
    return this.sightingsService.findByMissingPerson(id);
  }
}
