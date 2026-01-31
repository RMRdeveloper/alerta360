import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GlossaryService } from './glossary.service';
import { GlossaryResponseDto } from './dto/glossary-response.dto';

@ApiTags('glossary')
@Controller('glossary')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get()
  @ApiOperation({ summary: 'Get glossary by locale' })
  @ApiQuery({
    name: 'locale',
    required: false,
    description: 'Locale code (e.g. es, en). Falls back to en if unsupported.',
  })
  @ApiResponse({
    status: 200,
    description: 'Glossary categories and terms in the requested locale.',
    type: GlossaryResponseDto,
  })
  getGlossary(@Query('locale') locale?: string) {
    return this.glossaryService.getGlossary(locale ?? 'en');
  }
}
