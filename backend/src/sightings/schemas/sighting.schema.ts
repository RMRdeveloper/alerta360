import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SightingDocument = HydratedDocument<Sighting>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      // transform missingPersonId to missingPerson if populated
      if (ret.missingPersonId && (typeof ret.missingPersonId === 'object' || ret.missingPersonId.coordinates)) {
        ret.missingPerson = ret.missingPersonId;
        delete ret.missingPersonId;
      }
      return ret;
    },
  },
})
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
