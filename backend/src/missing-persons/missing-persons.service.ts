import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MissingPerson } from './schemas/missing-person.schema';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';

@Injectable()
export class MissingPersonsService {
  constructor(@InjectModel(MissingPerson.name) private missingPersonModel: Model<MissingPerson>) { }

  async create(createMissingPersonDto: CreateMissingPersonDto): Promise<MissingPerson> {
    const createdMissingPerson = new this.missingPersonModel(createMissingPersonDto);
    return createdMissingPerson.save();
  }

  async findAll(): Promise<MissingPerson[]> {
    return this.missingPersonModel.find().exec();
  }

  async findOne(id: string): Promise<MissingPerson> {
    return this.missingPersonModel.findById(id).exec();
  }

  async update(id: string, updateMissingPersonDto: any): Promise<MissingPerson> {
    return this.missingPersonModel.findByIdAndUpdate(id, updateMissingPersonDto, { new: true }).exec();
  }

  async remove(id: string): Promise<MissingPerson> {
    return this.missingPersonModel.findByIdAndDelete(id).exec();
  }

  async count(status?: string): Promise<number> {
    const filter = status ? { status } : {};
    return this.missingPersonModel.countDocuments(filter).exec();
  }
}
