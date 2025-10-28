import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Message, MessageDocument } from "src/chat/models/message.model";
import { MessageRepositoryInterface } from "../abstract/message.repository-interface";

export class MessageRepository extends MongooseRepositoryBase<MessageDocument> implements MessageRepositoryInterface {
    constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {
        super(messageModel);
    }
}
