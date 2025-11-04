import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'revenuecats', timestamps: true })
export class RevenueCat {
  @Prop({ required: true, unique: true })
  revenuecatId: string;

  @Prop({ type: [String], required: true, default: [] })
  features: string[];
}

export type RevenueCatDocument = HydratedDocument<RevenueCat>;
export const RevenueCatSchema = SchemaFactory.createForClass(RevenueCat);
