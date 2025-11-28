import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFiles, Inject } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MissingPersonsService } from './missing-persons.service';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { IStorageService } from '../storage/storage.interface';
import { Express } from 'express';

@Controller('missing-persons')
export class MissingPersonsController {
  constructor(
    private readonly missingPersonsService: MissingPersonsService,
    @Inject(IStorageService) private readonly storageService: IStorageService,
  ) { }

  @Post()
  @UseInterceptors(FilesInterceptor('photos'))
  async create(
    @Body() createMissingPersonDto: CreateMissingPersonDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const photoUrls = await Promise.all(
        files.map(file => this.storageService.uploadFile(file))
      );
      createMissingPersonDto.photos = photoUrls;
    }
    return this.missingPersonsService.create(createMissingPersonDto);
  }

  @Get()
  findAll() {
    return this.missingPersonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.missingPersonsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMissingPersonDto: any) {
    return this.missingPersonsService.update(id, updateMissingPersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.missingPersonsService.remove(id);
  }
}
