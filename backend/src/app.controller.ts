import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MissingPersonsService } from './missing-persons/missing-persons.service';
import { SightingsService } from './sightings/sightings.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly missingPersonsService: MissingPersonsService,
    private readonly sightingsService: SightingsService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stats')
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
