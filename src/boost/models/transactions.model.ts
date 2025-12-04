import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TransactionType, SubscriptionType } from '../boost.enum';

@Schema({ collection: 'transactions', timestamps: true })
export class Transaction {
  @Prop({ required: true })
  revenueCatId: string;

  @Prop({ required: true })
  user: string;

  @Prop({ required: false })
  amount: number;

  @Prop({ required: false })
  store: string;

  @Prop({ required: false })
  currency: string;

  @Prop({ required: false })
  currencyAmount: number;

  @Prop({ required: false })
  date: Date;

  @Prop({ required: false })
  type: TransactionType;

  @Prop({ required: false })
  subscriptionType: SubscriptionType | null;
}

export type TransactionDocument = HydratedDocument<Transaction>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
