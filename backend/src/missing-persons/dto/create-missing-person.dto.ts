import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  Min,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { uploadConfig } from '../../config/app.config';

export class RewardDto {
  @ApiProperty({ description: 'Reward amount (must be >= 0)' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code (e.g. USD, EUR, MXN)' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateMissingPersonDto {
  @ApiProperty({ description: 'Full name of the missing person' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Age of the missing person' })
  @Type(() => Number)
  @IsNumber()
  age: number;

  @ApiProperty({
    description: 'Gender of the missing person',
    enum: ['Male', 'Female', 'Other'],
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ description: 'Last seen location address' })
  @IsString()
  @IsNotEmpty()
  lastSeenLocation: string;

  @ApiProperty({ description: 'Date and time when the person was last seen' })
  @Type(() => Date)
  @IsDate()
  lastSeenDate: Date;

  @ApiPropertyOptional({
    description: 'Physical description and other details',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: `Photos of the missing person (max ${uploadConfig.maxPhotosPerPost})`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(uploadConfig.maxPhotosPerPost)
  @IsString({ each: true })
  photos?: string[];

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
