import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SightingResponseDto {
  @ApiProperty({ description: 'Sighting ID' })
  _id: string;

  @ApiProperty({
    description: 'ID of the missing person or populated missing person object',
  })
  missingPersonId: string;

  @ApiProperty({ description: 'Location of the sighting' })
  location: string;

  @ApiProperty({ description: 'Date and time of the sighting' })
  date: Date;

  @ApiPropertyOptional({ description: 'Description of the sighting' })
  description?: string;

  @ApiPropertyOptional({ description: 'Photo URL of the sighting' })
  photo?: string;

  @ApiProperty({ description: 'Contact information of the reporter' })
  reporterContact: string;

  @ApiPropertyOptional({ description: 'Creation date' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last update date' })
  updatedAt?: Date;
}
