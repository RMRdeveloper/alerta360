import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SightingsService } from './sightings.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { IStorageService } from '../storage/storage.interface';
import { Express } from 'express';

@Controller('sightings')
export class SightingsController {
  constructor(
    private readonly sightingsService: SightingsService,
    @Inject(IStorageService) private readonly storageService: IStorageService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createSightingDto: CreateSightingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const photoUrl = await this.storageService.uploadFile(file);
      createSightingDto.photo = photoUrl;
    }
    return this.sightingsService.create(createSightingDto);
  }

  @Get()
  findAll() {
    return this.sightingsService.findAll();
  }

  @Get('person/:id')
  findByMissingPerson(@Param('id') id: string) {
    return this.sightingsService.findByMissingPerson(id);
  }
}
