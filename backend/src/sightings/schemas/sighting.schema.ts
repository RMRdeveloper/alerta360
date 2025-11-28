import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SightingDocument = HydratedDocument<Sighting>;

@Schema({ timestamps: true })
export class Sighting {
  @Prop({ type: Types.ObjectId, ref: 'MissingPerson', required: true })
  missingPersonId: Types.ObjectId;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  description: string;

  @Prop()
  photo: string;

  @Prop({ required: true })
  reporterContact: string;
}

export const SightingSchema = SchemaFactory.createForClass(Sighting);
