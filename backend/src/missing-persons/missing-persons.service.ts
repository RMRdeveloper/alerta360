import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { MissingPerson } from './schemas/missing-person.schema';
import { Sighting } from '../sightings/schemas/sighting.schema';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { MissingPersonsQueryDto } from './dto/missing-persons-query.dto';
import { paginationConfig } from '../config/app.config';

@Injectable()
export class MissingPersonsService {
  constructor(
    @InjectModel(MissingPerson.name)
    private missingPersonModel: Model<MissingPerson>,
    @InjectModel(Sighting.name)
    private sightingModel: Model<Sighting>,
  ) {}

  async create(
    createMissingPersonDto: CreateMissingPersonDto,
    userId: string,
  ): Promise<MissingPerson> {
    const createdMissingPerson = new this.missingPersonModel({
      ...createMissingPersonDto,
      reporterId: new Types.ObjectId(userId),
    });
    return createdMissingPerson.save();
  }

  async findAll(): Promise<MissingPerson[]> {
    return this.missingPersonModel.find().exec();
  }

  async findAllPaginated(query: MissingPersonsQueryDto): Promise<{
    items: MissingPerson[];
    total: number;
    page: number;
    factor: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const factor = query.factor ?? paginationConfig.defaultPageSize;
    const sort = query.sort ?? 'recent';

    const filter = this.buildFilter(query);

    if (query.hasSightings === true) {
      const idsWithSightings = await this.sightingModel
        .distinct('missingPersonId')
        .exec();
      filter._id = { $in: idsWithSightings };
    }

    const sortOptions =
      sort === 'recent'
        ? { createdAt: -1 as const }
        : { createdAt: -1 as const };
    const skip = (page - 1) * factor;

    const [items, total] = await Promise.all([
      this.missingPersonModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(factor)
        .exec(),
      this.missingPersonModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / factor);

    return {
      items,
      total,
      page,
      factor,
      totalPages,
    };
  }

  private buildFilter(
    query: MissingPersonsQueryDto,
  ): FilterQuery<MissingPerson> {
    const filter: FilterQuery<MissingPerson> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.gender) {
      filter.gender = query.gender;
    }

    if (query.name?.trim()) {
      filter.name = { $regex: query.name.trim(), $options: 'i' };
    }

    if (query.minAge !== undefined || query.maxAge !== undefined) {
      filter.age = {};
      if (query.minAge !== undefined) filter.age.$gte = query.minAge;
      if (query.maxAge !== undefined) filter.age.$lte = query.maxAge;
    }

    if (query.lastSeenFrom || query.lastSeenTo) {
      filter.lastSeenDate = {};
      if (query.lastSeenFrom) filter.lastSeenDate.$gte = query.lastSeenFrom;
      if (query.lastSeenTo) filter.lastSeenDate.$lte = query.lastSeenTo;
    }

    if (
      (query.minHeight !== undefined || query.maxHeight !== undefined) &&
      query.heightUnit
    ) {
      filter['height.unit'] = query.heightUnit;
      filter['height.value'] = {};
      if (query.minHeight !== undefined)
        filter['height.value'].$gte = query.minHeight;
      if (query.maxHeight !== undefined)
        filter['height.value'].$lte = query.maxHeight;
    }

    if (query.hairColor) {
      filter['hair.color'] = query.hairColor;
    }

    if (query.hairLength) {
      filter['hair.length'] = query.hairLength;
    }

    if (query.eyes) {
      filter.eyes = query.eyes;
    }

    if (query.build) {
      filter.build = query.build;
    }

    if (query.minRewardAmount !== undefined) {
      filter['reward.amount'] = { $gte: query.minRewardAmount };
    }
    if (query.rewardCurrency) {
      filter['reward.currency'] = query.rewardCurrency;
    }

    return filter;
  }

  async findOne(id: string): Promise<MissingPerson> {
    return this.missingPersonModel.findById(id).exec();
  }

  async update(
    id: string,
    updateMissingPersonDto: Record<string, unknown>,
  ): Promise<MissingPerson> {
    const safeDto = { ...updateMissingPersonDto } as Record<string, unknown>;
    delete safeDto.reporterId;
    delete safeDto.existingPhotos;
    return this.missingPersonModel
      .findByIdAndUpdate(id, safeDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<MissingPerson> {
    return this.missingPersonModel.findByIdAndDelete(id).exec();
  }

  async count(status?: string): Promise<number> {
    const filter = status ? { status } : {};
    return this.missingPersonModel.countDocuments(filter).exec();
  }
}
