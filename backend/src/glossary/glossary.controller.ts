import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { glossarySwaggerDescriptions } from './glossary.constants';
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
    description: glossarySwaggerDescriptions.localeQuery,
  })
  @ApiResponse({
    status: 200,
    description: glossarySwaggerDescriptions.glossaryByLocale,
    type: GlossaryResponseDto,
  })
  getGlossary(@Query('locale') locale?: string) {
    return this.glossaryService.getGlossary(locale ?? 'en');
  }
}
