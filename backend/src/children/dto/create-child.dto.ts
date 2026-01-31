import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChildDto {
  @ApiProperty({ description: 'Full name of the child' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Age of the child' })
  @Type(() => Number)
  @IsNumber()
  age: number;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Photos of the child',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({ description: 'Contact information of the parent/guardian' })
  @IsString()
  @IsNotEmpty()
  parentContact: string;
}
