import { BaseRepository } from 'src/common/repository/abstract/base.repository';
import { Notification, NotificationType } from '../../models/notification.model';
import { Types } from 'mongoose';
import { NotificationDocument } from '../../models/notification.model';

export const NotificationRepositoryInterface = 'NotificationRepositoryInterface';

export interface NotificationRepositoryInterface extends BaseRepository<NotificationDocument> {
  createNotification(notification: Partial<Notification>): Promise<Notification>;
  getNotificationsForUser(userId: Types.ObjectId, type?: NotificationType): Promise<Notification[]>;
  markAsRead(notificationId: Types.ObjectId): Promise<void>;
  getSentConnectionRequests(userId: Types.ObjectId): Promise<Notification[]>;
} 