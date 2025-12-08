import { IsString, IsDate, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSightingDto {
  @ApiProperty({ description: 'ID of the missing person' })
  @IsMongoId()
  missingPersonId: string;

  @ApiProperty({ description: 'Location of the sighting' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Date and time of the sighting' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional({ description: 'Description of the sighting' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Photo of the sighting' })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({ description: 'Contact information of the reporter' })
  @IsString()
  reporterContact: string;
}
