import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { User } from 'src/user/models/user.model';

export enum ChatRoomType {
  BUSINESS = 'business',
  PRIMARY = 'primary',
  GENERAL = 'general',
}

@Schema({ timestamps: true, collection: 'chat-rooms' })
export class ChatRoom {
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: User.name,
  })
  users: mongoose.Types.ObjectId[];

  @Prop({
    type: String,
    required: true,
    enum: ChatRoomType,
    default: ChatRoomType.GENERAL,
  })
  type: ChatRoomType;
}

export type ChatRoomDocument = HydratedDocument<ChatRoom>;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
