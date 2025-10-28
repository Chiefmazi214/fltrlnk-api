import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { MessageDocument } from "src/chat/models/message.model";

export const MessageRepositoryInterface = 'MessageRepositoryInterface';

export interface MessageRepositoryInterface extends BaseRepository<MessageDocument> {
}
