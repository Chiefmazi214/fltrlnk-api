import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/models/user.model';
import { ChatRoomType } from '../chat.types';



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
