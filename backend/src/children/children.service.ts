import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child } from './schemas/child.schema';
import { CreateChildDto } from './dto/create-child.dto';

@Injectable()
export class ChildrenService {
  constructor(@InjectModel(Child.name) private childModel: Model<Child>) {}

  async create(createChildDto: CreateChildDto): Promise<Child> {
    const createdChild = new this.childModel(createChildDto);
    return createdChild.save();
  }

  async findAll(): Promise<Child[]> {
    return this.childModel.find().exec();
  }

  async findOne(id: string): Promise<Child> {
    return this.childModel.findById(id).exec();
  }
}
