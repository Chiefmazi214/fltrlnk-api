import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { ChatRoomDocument } from "src/chat/models/chat-room.model";

export const ChatRoomRepositoryInterface = 'ChatRoomRepositoryInterface';

export interface ChatRoomRepositoryInterface extends BaseRepository<ChatRoomDocument> {
}
