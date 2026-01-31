import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MissingPersonRewardResponseDto {
  @ApiProperty({ description: 'Reward amount' })
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  currency?: string;
}

export class MissingPersonResponseDto {
  @ApiProperty({ description: 'Missing person ID' })
  _id: string;

  @ApiProperty({ description: 'Full name of the missing person' })
  name: string;

  @ApiProperty({ description: 'Age of the missing person' })
  age: number;

  @ApiProperty({ description: 'Gender of the missing person' })
  gender: string;

  @ApiProperty({ description: 'Last seen location address' })
  lastSeenLocation: string;

  @ApiProperty({ description: 'Date and time when the person was last seen' })
  lastSeenDate: Date;

  @ApiPropertyOptional({
    description: 'Physical description and other details',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Photos of the missing person',
    type: [String],
  })
  photos?: string[];

  @ApiProperty({ description: 'Status (missing, found, deceased)' })
  status: string;

  @ApiPropertyOptional({ description: 'ID of the reporter' })
  reporterId?: string;

  @ApiPropertyOptional({
    description: 'Height of the person',
    example: { value: 180, unit: 'cm' },
  })
  height?: { value: number; unit: string };

  @ApiPropertyOptional({
    description: 'Hair characteristics',
    example: { color: 'Black', length: 'Short' },
  })
  hair?: { color: string; length: string };

  @ApiPropertyOptional({ description: 'Eye color' })
  eyes?: string;

  @ApiPropertyOptional({ description: 'Body build type' })
  build?: string;

  @ApiPropertyOptional({
    description: 'GeoJSON coordinates',
    example: { type: 'Point', coordinates: [-58.3816, -34.6037] },
  })
  coordinates?: { type: string; coordinates: number[] };

  @ApiPropertyOptional({
    description: 'Optional reward for information',
    type: MissingPersonRewardResponseDto,
  })
  reward?: MissingPersonRewardResponseDto;

  @ApiPropertyOptional({ description: 'Creation date' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last update date' })
  updatedAt?: Date;
}
