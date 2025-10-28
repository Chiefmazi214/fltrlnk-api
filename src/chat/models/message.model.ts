import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument } from "mongoose";
import { ChatRoom } from "./chat-room.model";
import { User } from "src/user/models/user.model";
import { Attachment } from "src/attachment/models/attachment.model";

@Schema({timestamps:true, collection: "messages"})
export class Message {
    @Prop({ required: true, type: String })
    content: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name })
    sender: mongoose.Types.ObjectId;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: ChatRoom.name })
    chatRoom: mongoose.Types.ObjectId;
    
    @Prop({ required: true, type: [mongoose.Schema.Types.ObjectId], ref: Attachment.name })
    attachments: mongoose.Types.ObjectId[];
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message); 

