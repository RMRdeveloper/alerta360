import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ImageModerationService } from './image-moderation.service';
import { imageModerationSwaggerDescriptions } from './image-moderation.constants';
import { ModerationCheckResponseDto } from './dto/moderation-check-response.dto';
import { Express } from 'express';

const imageFormFieldName = 'image';

@ApiTags('image-moderation')
@Controller('image-moderation')
export class ImageModerationController {
  constructor(
    private readonly imageModerationService: ImageModerationService,
  ) {}

  /**
   * Validates a single image for adult content. Returns whether the image is safe.
   * Intended for external services and apps to check content before submitting to the API.
   */
  @Post('check')
  @UseInterceptors(FileInterceptor(imageFormFieldName))
  @ApiOperation({
    summary: imageModerationSwaggerDescriptions.checkSummary,
    description: imageModerationSwaggerDescriptions.checkDescription,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [imageFormFieldName],
      properties: {
        [imageFormFieldName]: {
          type: 'string',
          format: 'binary',
          description: imageModerationSwaggerDescriptions.imageFileToValidate,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: imageModerationSwaggerDescriptions.moderationResult,
    type: ModerationCheckResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: imageModerationSwaggerDescriptions.noFileOrInvalidRequest,
  })
  async check(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ModerationCheckResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const safe = await this.imageModerationService.isImageSafe(file);
    return { safe };
  }
}
