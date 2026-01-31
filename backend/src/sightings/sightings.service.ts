import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sighting } from './schemas/sighting.schema';
import { CreateSightingDto } from './dto/create-sighting.dto';

@Injectable()
export class SightingsService {
  constructor(
    @InjectModel(Sighting.name) private sightingModel: Model<Sighting>,
  ) {}

  async create(createSightingDto: CreateSightingDto): Promise<Sighting> {
    const createdSighting = new this.sightingModel(createSightingDto);
    return createdSighting.save();
  }

  async findAll(): Promise<Sighting[]> {
    return this.sightingModel.find().populate('missingPersonId').exec();
  }

  async findByMissingPerson(missingPersonId: string): Promise<Sighting[]> {
    return this.sightingModel.find({ missingPersonId }).exec();
  }

  async count(): Promise<number> {
    return this.sightingModel.countDocuments().exec();
  }
}
