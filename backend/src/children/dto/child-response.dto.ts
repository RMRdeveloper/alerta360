import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChildResponseDto {
  @ApiProperty({ description: 'Child ID' })
  _id: string;

  @ApiProperty({ description: 'Full name of the child' })
  name: string;

  @ApiProperty({ description: 'Age of the child' })
  age: number;

  @ApiProperty({
    description: 'Photos of the child',
    type: [String],
  })
  photos: string[];

  @ApiProperty({ description: 'Contact information of the parent/guardian' })
  parentContact: string;

  @ApiPropertyOptional({ description: 'Creation date' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last update date' })
  updatedAt?: Date;
}
