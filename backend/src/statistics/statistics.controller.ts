import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('stats')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) { }

  @Get()
  getStats() {
    return this.statisticsService.getStats();
  }
}
