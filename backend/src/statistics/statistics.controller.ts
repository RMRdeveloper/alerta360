import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    description: 'Statistics data.',
    type: StatsResponseDto,
  })
  getStats() {
    return this.statisticsService.getStats();
  }
}
