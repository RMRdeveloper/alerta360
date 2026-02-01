import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { statisticsSwaggerDescriptions } from './statistics.constants';
import { StatisticsService } from './statistics.service';
import { StatsResponseDto } from './dto/stats-response.dto';

@ApiTags('stats')
@Controller('stats')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get statistics' })
  @ApiResponse({
    status: 200,
    description: statisticsSwaggerDescriptions.statisticsData,
    type: StatsResponseDto,
  })
  getStats() {
    return this.statisticsService.getStats();
  }
}
