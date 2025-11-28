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

  @Prop({ required: true })
  reporterId: string; // Could be a User ID or contact info for now

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  })
  coordinates?: { type: string; coordinates: number[] };
}

export const MissingPersonSchema = SchemaFactory.createForClass(MissingPerson);
MissingPersonSchema.index({ coordinates: '2dsphere' });
