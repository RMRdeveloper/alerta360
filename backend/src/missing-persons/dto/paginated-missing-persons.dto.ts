import { ApiProperty } from '@nestjs/swagger';
import { MissingPersonResponseDto } from './missing-person-response.dto';

export class PaginatedMissingPersonsDto {
  @ApiProperty({
    description: 'Array of missing persons for the current page',
    type: [MissingPersonResponseDto],
  })
  items: MissingPersonResponseDto[];

  @ApiProperty({
    description: 'Total number of records matching the filter',
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (1-based)',
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
  })
  factor: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  totalPages: number;
}
