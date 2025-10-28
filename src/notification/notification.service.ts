import { NotificationRepositoryInterface } from './repositories/abstract/notification.repository-interface';
import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationType } from './models/notification.model';
import { CreateNotificationDto } from './dtos/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NotificationRepositoryInterface)
    private notificationRepository: NotificationRepositoryInterface,
  ) {}

  async createNotification(notification: CreateNotificationDto) {
    const toObjectId = (id?: string) => (id ? new Types.ObjectId(id) : undefined);
    const payload: any = {
      ...notification,
      recipient: toObjectId(notification.recipientId),
      actor: toObjectId(notification.actorId),
      post: toObjectId(notification.postId),
      connection: toObjectId(notification.connectionId),
    };
    return this.notificationRepository.createNotification(payload);
  }

  async getNotificationsForUser(userId: string, type?: NotificationType) {
    const notifications = await this.notificationRepository.getNotificationsForUser(
      new Types.ObjectId(userId), 
      type
    );

    const deduplicatedNotifications = this.deduplicateNotifications(notifications);
    const sortedNotifications = this.sortNotificationsByDate(deduplicatedNotifications);
    
    return this.formatNotifications(sortedNotifications);
  }

  private deduplicateNotifications(notifications: any[]): any[] {
    const likeMap = new Map<string, any>();
    const followMap = new Map<string, any>();
    const otherNotifications: any[] = [];

    for (const notification of notifications) {
      if (this.isLikeNotification(notification)) {
        this.handleLikeNotification(notification, likeMap);
      } else if (this.isFollowNotification(notification)) {
        this.handleFollowNotification(notification, followMap);
      } else {
        otherNotifications.push(notification);
      }
    }

    return [
      ...otherNotifications,
      ...Array.from(likeMap.values()),
      ...Array.from(followMap.values())
    ];
  }

  private isLikeNotification(notification: any): boolean {
    return notification.type === NotificationType.LIKE && 
           notification.post && 
           notification.actor;
  }

  private isFollowNotification(notification: any): boolean {
    return notification.type === NotificationType.FOLLOW && 
           notification.actor && 
           notification.recipient;
  }

  private handleLikeNotification(notification: any, likeMap: Map<string, any>): void {
    const key = this.createLikeKey(notification);
    
    if (!likeMap.has(key) || this.isMoreRecent(notification, likeMap.get(key))) {
      likeMap.set(key, notification);
    }
  }

  private handleFollowNotification(notification: any, followMap: Map<string, any>): void {
    const key = this.createFollowKey(notification);
    
    if (!followMap.has(key) || this.isMoreRecent(notification, followMap.get(key))) {
      followMap.set(key, notification);
    }
  }

  private createLikeKey(notification: any): string {
    const postId = this.extractId(notification.post);
    const actorId = this.extractId(notification.actor);
    return `${postId}_${actorId}`;
  }

  private createFollowKey(notification: any): string {
    const actorId = this.extractId(notification.actor);
    const recipientId = this.extractId(notification.recipient);
    return `${actorId}_${recipientId}`;
  }

  private extractId(obj: any): string {
    return obj._id?.toString?.() || obj.toString();
  }

  private isMoreRecent(newNotification: any, existingNotification: any): boolean {
    return new Date(newNotification.createdAt) > new Date(existingNotification.createdAt);
  }

  private sortNotificationsByDate(notifications: any[]): any[] {
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private formatNotifications(notifications: any[]): any[] {
    return notifications.map(notification => 
      notification.toObject ? notification.toObject() : { ...notification }
    );
  }

  async markAsRead(notificationId: Types.ObjectId) {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async getSentConnectionRequests(userId: Types.ObjectId) {
    return this.notificationRepository.getSentConnectionRequests(userId);
  }
}
