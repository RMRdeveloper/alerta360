import { IsString, IsDate, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSightingDto {
  @IsMongoId()
  missingPersonId: string;

  @IsString()
  location: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  reporterContact: string;
}
