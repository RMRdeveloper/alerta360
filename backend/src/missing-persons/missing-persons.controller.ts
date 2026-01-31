import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Inject,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MissingPersonsService } from './missing-persons.service';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { UpdateMissingPersonDto } from './dto/update-missing-person.dto';
import { MissingPersonResponseDto } from './dto/missing-person-response.dto';
import { MissingPersonsQueryDto } from './dto/missing-persons-query.dto';
import { PaginatedMissingPersonsDto } from './dto/paginated-missing-persons.dto';
import { IStorageService } from '../storage/storage.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  uploadConfig,
  moderationMessages,
  imageModerationErrorCode,
} from '../config/app.config';
import { ImageModerationService } from '../image-moderation/image-moderation.service';

import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('missing-persons')
@Controller('missing-persons')
export class MissingPersonsController {
  constructor(
    private readonly missingPersonsService: MissingPersonsService,
    @Inject(IStorageService) private readonly storageService: IStorageService,
    private readonly imageModerationService: ImageModerationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new missing person' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Missing person registration data',
    type: CreateMissingPersonDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The missing person has been successfully registered.',
  })
  @ApiResponse({
    status: 400,
    description: `Maximum ${uploadConfig.maxPhotosPerPost} photos allowed per post.`,
  })
  @ApiResponse({
    status: 400,
    description: moderationMessages.multipleImagesRejected,
  })
  @UseInterceptors(FilesInterceptor('photos'))
  async create(
    @Body() createMissingPersonDto: CreateMissingPersonDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @Request() req?: { user: { _id: string } },
  ) {
    if (files && files.length > uploadConfig.maxPhotosPerPost) {
      throw new BadRequestException(
        `Maximum ${uploadConfig.maxPhotosPerPost} photos allowed per post`,
      );
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const safe = await this.imageModerationService.isImageSafe(file);
        if (!safe) {
          throw new BadRequestException({
            message: moderationMessages.multipleImagesRejected,
            errorCode: imageModerationErrorCode,
          });
        }
      }
      const photoUrls = await Promise.all(
        files.map((file) => this.storageService.uploadFile(file)),
      );
      createMissingPersonDto.photos = photoUrls;
    }
    return this.missingPersonsService.create(
      createMissingPersonDto,
      req!.user._id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated and filtered missing persons' })
  @ApiQuery({ type: MissingPersonsQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of missing persons.',
    type: PaginatedMissingPersonsDto,
  })
  findAll(@Query() query: MissingPersonsQueryDto) {
    return this.missingPersonsService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a missing person by ID' })
  @ApiResponse({
    status: 200,
    description: 'The missing person details.',
    type: MissingPersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Missing person not found.' })
  findOne(@Param('id') id: string) {
    return this.missingPersonsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos'))
  @ApiOperation({ summary: 'Update a missing person (author only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields to update',
    type: UpdateMissingPersonDto,
  })
  @ApiResponse({
    status: 200,
    description: 'The missing person has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: `Maximum ${uploadConfig.maxPhotosPerPost} photos allowed per post.`,
  })
  @ApiResponse({
    status: 400,
    description: moderationMessages.multipleImagesRejected,
  })
  @ApiResponse({
    status: 403,
    description: 'Not the author of this publication.',
  })
  @ApiResponse({ status: 404, description: 'Missing person not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateMissingPersonDto: UpdateMissingPersonDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @Request() req?: { user: { _id: string } },
  ) {
    const doc = await this.missingPersonsService.findOne(id);
    if (!doc) throw new NotFoundException('Missing person not found');

    const reporterIdStr = doc.reporterId?.toString?.() ?? doc.reporterId;
    const userIdStr = req!.user._id?.toString?.() ?? String(req!.user._id);
    if (!reporterIdStr || reporterIdStr !== userIdStr) {
      throw new ForbiddenException('Only the author can edit this publication');
    }

    const existingPhotos =
      (updateMissingPersonDto.existingPhotos as string[] | undefined) ?? [];
    const newFilesCount = files?.length ?? 0;
    const totalPhotos = existingPhotos.length + newFilesCount;

    if (totalPhotos > uploadConfig.maxPhotosPerPost) {
      throw new BadRequestException(
        `Maximum ${uploadConfig.maxPhotosPerPost} photos allowed per post`,
      );
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const safe = await this.imageModerationService.isImageSafe(file);
        if (!safe) {
          throw new BadRequestException({
            message: moderationMessages.multipleImagesRejected,
            errorCode: imageModerationErrorCode,
          });
        }
      }
      const newPhotoUrls = await Promise.all(
        files.map((file) => this.storageService.uploadFile(file)),
      );
      updateMissingPersonDto.photos = [...existingPhotos, ...newPhotoUrls];
    } else {
      updateMissingPersonDto.photos = existingPhotos;
    }
    delete (updateMissingPersonDto as Record<string, unknown>).existingPhotos;

    return this.missingPersonsService.update(
      id,
      updateMissingPersonDto as unknown as Record<string, unknown>,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a missing person (author only)' })
  @ApiResponse({
    status: 200,
    description: 'The missing person has been successfully deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'Not the author of this publication.',
  })
  @ApiResponse({ status: 404, description: 'Missing person not found.' })
  async remove(
    @Param('id') id: string,
    @Request() req?: { user: { _id: string } },
  ) {
    const doc = await this.missingPersonsService.findOne(id);
    if (!doc) throw new NotFoundException('Missing person not found');

    const reporterIdStr = doc.reporterId?.toString?.() ?? doc.reporterId;
    const userIdStr = req!.user._id?.toString?.() ?? String(req!.user._id);
    if (!reporterIdStr || reporterIdStr !== userIdStr) {
      throw new ForbiddenException(
        'Only the author can delete this publication',
      );
    }

    return this.missingPersonsService.remove(id);
  }
}
