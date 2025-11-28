import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChildDocument = HydratedDocument<Child>;

@Schema({ timestamps: true })
export class Child {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop([String])
  photos: string[];

  @Prop({ required: true })
  parentContact: string;
}

export const ChildSchema = SchemaFactory.createForClass(Child);
