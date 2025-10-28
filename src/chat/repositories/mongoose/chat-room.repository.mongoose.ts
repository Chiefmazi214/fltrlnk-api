import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { ChatRoom, ChatRoomDocument } from "src/chat/models/chat-room.model";
import { ChatRoomRepositoryInterface } from "../abstract/chat-room.repository-interface";

export class ChatRoomRepository extends MongooseRepositoryBase<ChatRoomDocument> implements ChatRoomRepositoryInterface {
    constructor(@InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>) {
        super(chatRoomModel);
    }
}
