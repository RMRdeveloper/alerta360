import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFiles, Inject } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MissingPersonsService } from './missing-persons.service';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { IStorageService } from '../storage/storage.interface';
import { Express } from 'express';


import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('missing-persons')
@Controller('missing-persons')
export class MissingPersonsController {
  constructor(
    private readonly missingPersonsService: MissingPersonsService,
    @Inject(IStorageService) private readonly storageService: IStorageService,
  ) { }


  @Post()
  @ApiOperation({ summary: 'Register a new missing person' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Missing person registration data',
    type: CreateMissingPersonDto,
  })
  @ApiResponse({ status: 201, description: 'The missing person has been successfully registered.' })
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
  @ApiOperation({ summary: 'Get all missing persons' })
  @ApiResponse({ status: 200, description: 'List of all missing persons.' })
  findAll() {
    return this.missingPersonsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a missing person by ID' })
  @ApiResponse({ status: 200, description: 'The missing person details.' })
  @ApiResponse({ status: 404, description: 'Missing person not found.' })
  findOne(@Param('id') id: string) {
    return this.missingPersonsService.findOne(id);
  }


  @Put(':id')
  @ApiOperation({ summary: 'Update a missing person' })
  @ApiResponse({ status: 200, description: 'The missing person has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateMissingPersonDto: any) {
    return this.missingPersonsService.update(id, updateMissingPersonDto);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete a missing person' })
  @ApiResponse({ status: 200, description: 'The missing person has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.missingPersonsService.remove(id);
  }
}
