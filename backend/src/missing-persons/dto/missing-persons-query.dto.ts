import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { paginationConfig, rewardCurrencies } from '../../config/app.config';

const hairColors = [
  'black',
  'brown',
  'blonde',
  'red',
  'gray',
  'bald',
  'other',
] as const;
const hairLengths = ['short', 'medium', 'long', 'bald'] as const;
const eyeColors = ['brown', 'blue', 'green', 'hazel', 'gray', 'other'] as const;
const buildTypes = [
  'slender',
  'athletic',
  'average',
  'heavy',
  'obese',
] as const;

export class MissingPersonsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: paginationConfig.defaultPageSize,
    minimum: 1,
    maximum: paginationConfig.maxPageSize,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(paginationConfig.maxPageSize)
  factor?: number = paginationConfig.defaultPageSize;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['missing', 'found', 'deceased'],
  })
  @IsOptional()
  @IsIn(['missing', 'found', 'deceased'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['recent'],
  })
  @IsOptional()
  @IsIn(['recent'])
  sort?: string;

  @ApiPropertyOptional({
    description: 'Partial name search (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    enum: ['Male', 'Female', 'Other'],
  })
  @IsOptional()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'Minimum age (>=)',
    minimum: 0,
    maximum: 150,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(150)
  minAge?: number;

  @ApiPropertyOptional({
    description: 'Maximum age (<=)',
    minimum: 0,
    maximum: 150,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(150)
  maxAge?: number;

  @ApiPropertyOptional({
    description: 'Last seen date from (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastSeenFrom?: Date;

  @ApiPropertyOptional({
    description: 'Last seen date to (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastSeenTo?: Date;

  @ApiPropertyOptional({
    description: 'Minimum height',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minHeight?: number;

  @ApiPropertyOptional({
    description: 'Maximum height',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxHeight?: number;

  @ApiPropertyOptional({
    description: 'Height unit for minHeight/maxHeight',
    enum: ['cm', 'ft'],
  })
  @IsOptional()
  @IsIn(['cm', 'ft'])
  heightUnit?: string;

  @ApiPropertyOptional({
    description: 'Hair color',
    enum: hairColors,
  })
  @IsOptional()
  @IsIn(hairColors)
  hairColor?: string;

  @ApiPropertyOptional({
    description: 'Hair length',
    enum: hairLengths,
  })
  @IsOptional()
  @IsIn(hairLengths)
  hairLength?: string;

  @ApiPropertyOptional({
    description: 'Eye color',
    enum: eyeColors,
  })
  @IsOptional()
  @IsIn(eyeColors)
  eyes?: string;

  @ApiPropertyOptional({
    description: 'Body build',
    enum: buildTypes,
  })
  @IsOptional()
  @IsIn(buildTypes)
  build?: string;

  @ApiPropertyOptional({
    description:
      'Minimum reward amount (cases with reward.amount >= this value)',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRewardAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter by reward currency',
    enum: rewardCurrencies,
  })
  @IsOptional()
  @IsIn(rewardCurrencies)
  rewardCurrency?: string;

  @ApiPropertyOptional({
    description: 'Filter to persons that have at least one sighting report',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasSightings?: boolean;
}
