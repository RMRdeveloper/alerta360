import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MissingPerson, MissingPersonSchema } from '../missing-persons/schemas/missing-person.schema';
import { Sighting, SightingSchema } from '../sightings/schemas/sighting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MissingPerson.name, schema: MissingPersonSchema },
      { name: Sighting.name, schema: SightingSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule { }
