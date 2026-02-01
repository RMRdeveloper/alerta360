import { ApiProperty } from '@nestjs/swagger';

export class ModerationCheckResponseDto {
  @ApiProperty({
    description: 'Whether the image is safe (no adult content detected).',
    example: true,
  })
  safe: boolean;
}
