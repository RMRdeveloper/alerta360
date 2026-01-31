import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty({ description: 'Count of missing persons' })
  missing: number;

  @ApiProperty({ description: 'Count of found persons' })
  found: number;

  @ApiProperty({ description: 'Count of sightings' })
  sightings: number;
}
