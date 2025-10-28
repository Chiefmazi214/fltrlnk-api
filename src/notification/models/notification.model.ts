import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum NotificationType {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  FOLLOW = 'FOLLOW',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
}

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  recipient: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  // Common fields
  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  actor: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Post' })
  post: Types.ObjectId;

  @Prop({ required: false, type: String })
  commentText: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Connection' })
  connection: Types.ObjectId;

  @Prop({ required: false, type: String })
  message: string;

  @Prop({ required: false, type: Boolean, default: false })
  isRead: boolean;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification); 