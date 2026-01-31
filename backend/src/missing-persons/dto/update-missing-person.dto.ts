import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { RewardDto } from './create-missing-person.dto';
import { uploadConfig } from '../../config/app.config';

export class UpdateMissingPersonDto {
  @ApiPropertyOptional({ description: 'Full name of the missing person' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Age of the missing person' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({
    description: 'Gender of the missing person',
    enum: ['Male', 'Female', 'Other'],
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Last seen location address' })
  @IsOptional()
  @IsString()
  lastSeenLocation?: string;

  @ApiPropertyOptional({
    description: 'Date and time when the person was last seen',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastSeenDate?: Date;

  @ApiPropertyOptional({
    description: 'Physical description and other details',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: `New photo files to add (merged with existingPhotos when provided, max ${uploadConfig.maxPhotosPerPost} total)`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(uploadConfig.maxPhotosPerPost)
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({
    description:
      'Existing photo URLs to keep (JSON array string when using multipart)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  existingPhotos?: string[];

  @ApiPropertyOptional({
    description: 'Status (missing, found, deceased)',
    enum: ['missing', 'found', 'deceased'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Height of the person',
    type: 'object',
    additionalProperties: true,
    example: { value: 180, unit: 'cm' },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  height?: { value: number; unit: string };

  @ApiPropertyOptional({
    description: 'Hair characteristics',
    type: 'object',
    additionalProperties: true,
    example: { color: 'Black', length: 'Short' },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  hair?: { color: string; length: string };

  @ApiPropertyOptional({ description: 'Eye color' })
  @IsOptional()
  @IsString()
  eyes?: string;

  @ApiPropertyOptional({ description: 'Body build type' })
  @IsOptional()
  @IsString()
  build?: string;

  @ApiPropertyOptional({
    description: 'GeoJSON coordinates',
    type: 'object',
    additionalProperties: true,
    example: { type: 'Point', coordinates: [-58.3816, -34.6037] },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  coordinates?: { type: string; coordinates: number[] };

  @ApiPropertyOptional({
    description: 'Optional reward for information',
    type: RewardDto,
    example: { amount: 1000, currency: 'USD' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RewardDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  reward?: RewardDto;
}
