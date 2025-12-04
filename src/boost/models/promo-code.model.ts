import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PromoCodeStatus } from '../boost.enum';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'promo_codes', timestamps: true })
export class PromoCode {
  @Prop({ required: true })
  code: string;

  @Prop({ default: PromoCodeStatus.ACTIVE })
  status: PromoCodeStatus;
}

export type PromoCodeDocument = HydratedDocument<PromoCode>;
export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);