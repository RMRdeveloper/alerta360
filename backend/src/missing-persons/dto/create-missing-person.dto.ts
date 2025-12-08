import { IsString, IsNumber, IsOptional, IsDate, IsArray, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMissingPersonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  lastSeenLocation: string;

  @Type(() => Date)
  @IsDate()
  lastSeenDate: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsOptional()
  @IsString()
  reporterId?: string;

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

  @IsOptional()
  @IsString()
  eyes?: string;

  @IsOptional()
  @IsString()
  build?: string;

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
