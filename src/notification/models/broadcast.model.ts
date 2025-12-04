import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BroadcastType } from '../notification.enum';
import { BroadcastTarget } from '../notification.enum';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'broadcasts', timestamps: true })
export class Broadcast {
  @Prop({ required: true, enum: BroadcastType })
  type: BroadcastType;

  @Prop({ required: true, enum: BroadcastTarget })
  target: BroadcastTarget;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  sender: string;

  @Prop({ required: true, type: Number })
  sentCount: number;
}

export type BroadcastDocument = HydratedDocument<Broadcast>;
export const BroadcastSchema = SchemaFactory.createForClass(Broadcast);