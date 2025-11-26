import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum SubscriptionType {
  BASIC = 'basic',
  PRO = 'pro',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  SIX_MONTHS = '6_months',
  ANNUAL = 'annual',
}

@Schema({ collection: 'subscriptions', timestamps: true })
export class Subscription {
  @Prop({ required: true })
  revenueCatId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, enum: SubscriptionType, required: true })
  subscriptionType: SubscriptionType;

  @Prop({ type: String, enum: SubscriptionPeriod, required: true })
  subscriptionPeriod: SubscriptionPeriod;

  @Prop({ type: String, enum: SubscriptionStatus, required: true, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false })
  endDate: Date;

  @Prop({ required: false })
  renewalDate: Date;

  @Prop({ required: false })
  cancellationDate: Date;

  @Prop({ required: false })
  expirationDate: Date;

  @Prop({ required: false })
  productId: string;

  @Prop({ required: false })
  store: string;

  @Prop({ required: false, default: false })
  willRenew: boolean;
}

export type SubscriptionDocument = HydratedDocument<Subscription>;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ revenueCatId: 1 });
SubscriptionSchema.index({ status: 1 });
