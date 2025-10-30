export interface ISendMessagePayload {
    chatRoomId: string;
    content: string;
}

export enum ChatRoomType {
  BUSINESS = 'business',
  PRIMARY = 'primary',
  GENERAL = 'general'
}

export enum ColabStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}