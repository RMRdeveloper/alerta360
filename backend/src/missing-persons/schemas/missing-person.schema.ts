import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MissingPersonDocument = HydratedDocument<MissingPerson>;

@Schema({ timestamps: true })
export class MissingPerson {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  lastSeenLocation: string;

  @Prop({ required: true })
  lastSeenDate: Date;

  @Prop()
  description: string;

  @Prop([String])
  photos: string[];

  @Prop({ default: 'missing' }) // missing, found, deceased
  status: string;

  @Prop({ required: false })
  reporterId?: string; // Optional now that auth is removed

  @Prop({
    type: {
      value: { type: Number },
      unit: { type: String, enum: ['cm', 'ft'], default: 'cm' },
    },
    _id: false,
  })
  height?: { value: number; unit: string };

  @Prop({
    type: {
      color: { type: String },
      length: { type: String },
    },
    _id: false,
  })
  hair?: { color: string; length: string };

  @Prop()
  eyes?: string;

  @Prop()
  build?: string;

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  })
  coordinates?: { type: string; coordinates: number[] };
}

export const MissingPersonSchema = SchemaFactory.createForClass(MissingPerson);
MissingPersonSchema.index({ coordinates: '2dsphere' });
