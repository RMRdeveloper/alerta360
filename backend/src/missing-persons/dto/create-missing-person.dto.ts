import { IsString, IsNumber, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMissingPersonDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  age: number;

  @IsString()
  gender: string;

  @IsString()
  lastSeenLocation: string;

  @Type(() => Date)
  @IsDate()
  lastSeenDate: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsString()
  reporterId: string;

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
}
