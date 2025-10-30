export interface ISendMessagePayload {
    chatRoomId: string;
    content: string;
}

export enum ChatRoomType {
  BUSINESS = 'business',
  PRIMARY = 'primary',
  GENERAL = 'general',
  COLAB = 'colab',
  FOLLOWERS = 'followers',
  REQUESTED = 'requested',
  LNKS = 'lnks',
  LIKES = 'likes',
  FLTR_ALERT = 'fltrAlert'
}