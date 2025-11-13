import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  IN_GRACE_PERIOD = 'in_grace_period',
  IN_BILLING_RETRY = 'in_billing_retry',
}

export enum PlanType {
  PRO = 'pro',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Schema({ collection: 'boosts', timestamps: true })
export class Boost {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'RevenueCat' })
  revenuecatId: Types.ObjectId;

  @Prop({ required: true })
  revenuecatSubscriptionId: string;

  @Prop({ type: String, enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Prop({ type: String, enum: PlanType, required: true })
  planType: PlanType;

  @Prop({ type: [String], required: true, default: [] })
  features: string[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ required: false })
  expirationDate?: Date;

  @Prop({ required: false })
  renewalDate?: Date;

  @Prop({ required: false })
  cancelledAt?: Date;

  @Prop({ type: Boolean, default: false })
  willRenew: boolean;

  @Prop({ type: Boolean, default: false })
  isInTrialPeriod: boolean;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ required: false })
  lastWebhookEventType?: string;

  @Prop({ required: false })
  lastWebhookReceivedAt?: Date;
}

export type BoostDocument = HydratedDocument<Boost>;
export const BoostSchema = SchemaFactory.createForClass(Boost);
