// sweepstakes.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SubscriptionType } from '../../boost/boost.enum';

@Schema({ collection: 'sweepstakes', timestamps: true })
export class Sweepstakes {
  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: Number, required: true })
  goal: number;

  @Prop({ type: String, enum: SubscriptionType, required: true })
  subscriptionType: SubscriptionType;

  @Prop({ type: Date, required: false })
  startDate?: Date;

  @Prop({ type: Date, required: false })
  endDate?: Date;

  @Prop({ type: Date, required: false })
  activationDeadline?: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export type SweepstakesDocument = HydratedDocument<Sweepstakes>;
export const SweepstakesSchema = SchemaFactory.createForClass(Sweepstakes);
