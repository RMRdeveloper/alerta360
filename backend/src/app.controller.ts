import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MissingPersonsService } from './missing-persons/missing-persons.service';
import { SightingsService } from './sightings/sightings.service';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsResponseDto } from './statistics/dto/stats-response.dto';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly missingPersonsService: MissingPersonsService,
    private readonly sightingsService: SightingsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Health check OK.',
    schema: { type: 'string' },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({
    status: 200,
    description: 'Application statistics.',
    type: StatsResponseDto,
  })
  async getStats() {
    const [missingCount, foundCount, sightingsCount] = await Promise.all([
      this.missingPersonsService.count('missing'),
      this.missingPersonsService.count('found'),
      this.sightingsService.count(),
    ]);

    return {
      missing: missingCount,
      found: foundCount,
      sightings: sightingsCount,
    };
  }
}
