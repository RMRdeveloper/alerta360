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
import { FirebaseOrJwtAuthGuard } from '../auth/guards/firebase-or-jwt-auth.guard';
import {
  uploadConfig,
  moderationMessages,
  imageModerationErrorCode,
} from '../config/app.config';
import { ImageModerationService } from '../image-moderation/image-moderation.service';
import {
  missingPersonsMessages,
  missingPersonsSwaggerDescriptions,
} from './missing-persons.constants';
import { swaggerDescriptions } from '../constants/swagger.constants';

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
  @UseGuards(FirebaseOrJwtAuthGuard)
  @ApiOperation({ summary: 'Register a new missing person' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: missingPersonsSwaggerDescriptions.registerData,
    type: CreateMissingPersonDto,
  })
  @ApiResponse({
    status: 201,
    description: missingPersonsSwaggerDescriptions.registeredSuccess,
  })
  @ApiResponse({
    status: 400,
    description: missingPersonsMessages.getMaxPhotosExceeded(),
  })
  @ApiResponse({
    status: 400,
    description: moderationMessages.multipleImagesRejected,
  })
  @UseInterceptors(FilesInterceptor('photos'))
  async create(
    @Body() createMissingPersonDto: CreateMissingPersonDto,
    @Request() req: { user: { _id: string } },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files && files.length > uploadConfig.maxPhotosPerPost) {
      throw new BadRequestException(
        missingPersonsMessages.getMaxPhotosExceeded(),
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
      req.user._id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated and filtered missing persons' })
  @ApiQuery({ type: MissingPersonsQueryDto })
  @ApiResponse({
    status: 200,
    description: missingPersonsSwaggerDescriptions.paginatedList,
    type: PaginatedMissingPersonsDto,
  })
  findAll(@Query() query: MissingPersonsQueryDto) {
    return this.missingPersonsService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a missing person by ID' })
  @ApiResponse({
    status: 200,
    description: missingPersonsSwaggerDescriptions.details,
    type: MissingPersonResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: swaggerDescriptions.missingPersonNotFound,
  })
  findOne(@Param('id') id: string) {
    return this.missingPersonsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(FirebaseOrJwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos'))
  @ApiOperation({ summary: 'Update a missing person (author only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: missingPersonsSwaggerDescriptions.fieldsToUpdate,
    type: UpdateMissingPersonDto,
  })
  @ApiResponse({
    status: 200,
    description: missingPersonsSwaggerDescriptions.updatedSuccess,
  })
  @ApiResponse({
    status: 400,
    description: missingPersonsMessages.getMaxPhotosExceeded(),
  })
  @ApiResponse({
    status: 400,
    description: moderationMessages.multipleImagesRejected,
  })
  @ApiResponse({
    status: 403,
    description: missingPersonsMessages.onlyAuthorCanEdit,
  })
  @ApiResponse({
    status: 404,
    description: swaggerDescriptions.missingPersonNotFound,
  })
  async update(
    @Param('id') id: string,
    @Body() updateMissingPersonDto: UpdateMissingPersonDto,
    @Request() req: { user: { _id: string } },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const missingPerson = await this.missingPersonsService.findOne(id);
    if (!missingPerson)
      throw new NotFoundException(missingPersonsMessages.notFound);

    this.ensureUserIsAuthor(
      missingPerson,
      req.user._id,
      missingPersonsMessages.onlyAuthorCanEdit,
    );

    const existingPhotos =
      (updateMissingPersonDto.existingPhotos as string[] | undefined) ?? [];
    const newFilesCount = files?.length ?? 0;
    const totalPhotos = existingPhotos.length + newFilesCount;

    if (totalPhotos > uploadConfig.maxPhotosPerPost) {
      throw new BadRequestException(
        missingPersonsMessages.getMaxPhotosExceeded(),
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
  @UseGuards(FirebaseOrJwtAuthGuard)
  @ApiOperation({ summary: 'Delete a missing person (author only)' })
  @ApiResponse({
    status: 200,
    description: missingPersonsSwaggerDescriptions.deletedSuccess,
  })
  @ApiResponse({
    status: 403,
    description: missingPersonsMessages.onlyAuthorCanDelete,
  })
  @ApiResponse({
    status: 404,
    description: swaggerDescriptions.missingPersonNotFound,
  })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { _id: string } },
  ) {
    const missingPerson = await this.missingPersonsService.findOne(id);
    if (!missingPerson)
      throw new NotFoundException(missingPersonsMessages.notFound);

    this.ensureUserIsAuthor(
      missingPerson,
      req.user._id,
      missingPersonsMessages.onlyAuthorCanDelete,
    );

    return this.missingPersonsService.remove(id);
  }

  private ensureUserIsAuthor(
    missingPerson: { reporterId?: { toString?: () => string } | string },
    userId: string,
    forbiddenMessage: string,
  ): void {
    const reporterIdStr =
      missingPerson.reporterId?.toString?.() ?? missingPerson.reporterId;
    const userIdStr = userId?.toString?.() ?? String(userId);
    if (!reporterIdStr || reporterIdStr !== userIdStr) {
      throw new ForbiddenException(forbiddenMessage);
    }
  }
}
