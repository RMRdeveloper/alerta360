import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MissingPerson, MissingPersonDocument } from '../missing-persons/schemas/missing-person.schema';
import { Sighting, SightingDocument } from '../sightings/schemas/sighting.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(MissingPerson.name) private missingPersonModel: Model<MissingPersonDocument>,
    @InjectModel(Sighting.name) private sightingModel: Model<SightingDocument>,
  ) { }

  async getStats() {
    const [missingCount, foundCount, sightingsCount] = await Promise.all([
      this.missingPersonModel.countDocuments({ status: 'desaparecido' }),
      this.missingPersonModel.countDocuments({ status: 'encontrado' }),
      this.sightingModel.countDocuments(),
    ]);

    return {
      missing: missingCount,
      found: foundCount,
      sightings: sightingsCount,
    };
  }
}
