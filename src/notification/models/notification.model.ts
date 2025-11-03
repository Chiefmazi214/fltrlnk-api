import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Colab } from 'src/chat/models/colab.model';
import { Follow } from 'src/connection/models/follow.model';
import { Like } from 'src/connection/models/like.model';

export enum NotificationType {
  GENERAL = 'GENERAL',
  EMAIL = 'EMAIL',
  COLAB_ACCEPTED = 'COLAB_ACCEPTED',
  COLAB_REJECTED = 'COLAB_REJECTED',
  COLAB_REQUESTED = 'COLAB_REQUESTED',
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

  @Prop({ required: false, type: Types.ObjectId, ref: Colab.name })
  colab: string;

  @Prop({ required: false, type: Types.ObjectId, ref: Like.name })
  like: string;

  @Prop({ required: false, type: Types.ObjectId, ref: Follow.name })
  follow: string;

  @Prop({ required: false, type: String })
  message: string;

  @Prop({ required: false, type: String })
  title: string;

  @Prop({ required: false, type: Boolean, default: false })
  isRead: boolean;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
