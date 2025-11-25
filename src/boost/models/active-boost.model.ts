import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ActiveBoostStatus, BoostType } from '../boost.enum';

@Schema({ timestamps: true })
export class ActiveBoost {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, enum: BoostType })
  type: BoostType;

  @Prop({ required: true, default: 0 })
  count: number;

  @Prop({ required: true, enum: ActiveBoostStatus, default: ActiveBoostStatus.ACTIVE })
  status: ActiveBoostStatus;

  @Prop({ required: true, type: Date })
  startDate: Date;
}

export type ActiveBoostDocument = HydratedDocument<ActiveBoost>;
export const ActiveBoostSchema = SchemaFactory.createForClass(ActiveBoost);
