import { ApiProperty } from '@nestjs/swagger';

export class GlossaryTermDto {
  @ApiProperty({ description: 'Term key identifier' })
  key: string;

  @ApiProperty({ description: 'Localized term label' })
  term: string;

  @ApiProperty({ description: 'Localized definition' })
  definition: string;
}

export class GlossaryCategoryDto {
  @ApiProperty({ description: 'Category identifier' })
  id: string;

  @ApiProperty({ description: 'Localized category label' })
  label: string;

  @ApiProperty({
    description: 'Terms in this category',
    type: [GlossaryTermDto],
  })
  terms: GlossaryTermDto[];
}

export class GlossaryResponseDto {
  @ApiProperty({
    description: 'Glossary categories with terms',
    type: [GlossaryCategoryDto],
  })
  categories: GlossaryCategoryDto[];
}
