import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class BoostData {
  @Prop({ required: true, default: 0 })
  fltr: number;

  @Prop({ required: true, default: 0 })
  lnk: number;

  @Prop({ required: true, default: 0 })
  match: number;

  @Prop({ required: true, default: 0 })
  gps: number;

  @Prop({ required: true, default: 0 })
  loc: number;

  @Prop({ required: true, default: 0 })
  users: number;
  
  @Prop({ required: true, default: 0 })
  search: number;
}

@Schema({ timestamps: true })
export class Boost {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, type: BoostData, default: { fltr: 0, lnk: 0, match: 0, gps: 0, loc: 0, users: 0, search: 0 } })
  boosts: BoostData;
}

export type BoostDocument = HydratedDocument<Boost>;
export const BoostSchema = SchemaFactory.createForClass(Boost);