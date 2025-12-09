import { NotificationRepositoryInterface } from './repositories/abstract/notification.repository-interface';
import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { NotificationType } from './models/notification.model';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { Expo } from 'expo-server-sdk';
import { UserService } from 'src/user/user.service';
import { MailService } from './mail.service';
import { SendBroadcastDto } from './dtos/send-mass-message.dto';
import { BroadcastTarget, BroadcastType } from './notification.enum';
import { ProfileType, UserTier } from 'src/user/user.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Broadcast, BroadcastDocument } from './models/broadcast.model';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class NotificationService {
  private readonly expo: Expo;

  constructor(
    private readonly userService: UserService,
    @InjectModel(Broadcast.name)
    private readonly broadcastModel: Model<BroadcastDocument>,
    @Inject(NotificationRepositoryInterface)
    private readonly notificationRepository: NotificationRepositoryInterface,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {
    this.expo = new Expo();
  }

  private async sendExpoPushNotification(
    expoPushToken: string,
    title: string,
    message: string,
  ) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(`Invalid Expo push token: ${expoPushToken}`);
      return;
    }

    try {
      await this.expo.sendPushNotificationsAsync([
        {
          to: expoPushToken,
          sound: 'default',
          title,
          body: message,
        },
      ]);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private async sendExpoPushNotificationToUsers(
    expoPushTokens: string[],
    title: string,
    message: string,
  ) {
    const validExpoPushTokens = expoPushTokens.filter((token) =>
      Expo.isExpoPushToken(token),
    );

    try {
      await this.expo.sendPushNotificationsAsync([
        {
          to: validExpoPushTokens,
          sound: 'default',
          title,
          body: message,
        },
      ]);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async createNotification(input: CreateNotificationDto) {
    const toObjectId = (id?: string) =>
      id ? new Types.ObjectId(id) : undefined;
    const payload: any = {
      ...input,
      recipient: toObjectId(input.recipientId),
      actor: toObjectId(input.actorId),
      post: toObjectId(input.postId),
      connection: toObjectId(input.connectionId),
      colab: toObjectId(input.colabId),
    };
    const notification =
      await this.notificationRepository.createNotification(payload);

    if (input.recipientId) {
      const user = await this.userService.getUserById(input.recipientId);
      if (input.type === NotificationType.EMAIL) {
        this.mailService.sendNotification(
          [user?.email],
          input.title,
          input.message,
        );
      } else if (user?.expoPushToken) {
        await this.sendExpoPushNotification(
          user.expoPushToken,
          input.title || 'New Notification',
          input.message || 'You have a new notification',
        );
      }
    }

    return notification;
  }

  async getNotificationsForUser(userId: string, type?: NotificationType) {
    const notifications =
      await this.notificationRepository.getNotificationsForUser(
        new Types.ObjectId(userId),
        type,
      );

    const deduplicatedNotifications =
      this.deduplicateNotifications(notifications);
    const sortedNotifications = this.sortNotificationsByDate(
      deduplicatedNotifications,
    );

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
      ...Array.from(followMap.values()),
    ];
  }

  private isLikeNotification(notification: any): boolean {
    return (
      notification.type === NotificationType.LIKE &&
      notification.post &&
      notification.actor
    );
  }

  private isFollowNotification(notification: any): boolean {
    return (
      notification.type === NotificationType.FOLLOW &&
      notification.actor &&
      notification.recipient
    );
  }

  private handleLikeNotification(
    notification: any,
    likeMap: Map<string, any>,
  ): void {
    const key = this.createLikeKey(notification);

    if (
      !likeMap.has(key) ||
      this.isMoreRecent(notification, likeMap.get(key))
    ) {
      likeMap.set(key, notification);
    }
  }

  private handleFollowNotification(
    notification: any,
    followMap: Map<string, any>,
  ): void {
    const key = this.createFollowKey(notification);

    if (
      !followMap.has(key) ||
      this.isMoreRecent(notification, followMap.get(key))
    ) {
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

  private isMoreRecent(
    newNotification: any,
    existingNotification: any,
  ): boolean {
    return (
      new Date(newNotification.createdAt) >
      new Date(existingNotification.createdAt)
    );
  }

  private sortNotificationsByDate(notifications: any[]): any[] {
    return notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  private formatNotifications(notifications: any[]): any[] {
    return notifications.map((notification) =>
      notification.toObject ? notification.toObject() : { ...notification },
    );
  }

  async markAsRead(notificationId: Types.ObjectId) {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async getSentConnectionRequests(userId: Types.ObjectId) {
    return this.notificationRepository.getSentConnectionRequests(userId);
  }

  async sendBroadcast(input: SendBroadcastDto, senderId: string) {
    // Build query based on target - single query construction
    let query: any = {};
    switch (input.target) {
      case BroadcastTarget.INDIVIDUAL_USERS:
        query.profileType = ProfileType.INDIVIDUAL;
        break;
      case BroadcastTarget.BUSINESS_USERS:
        query.profileType = ProfileType.BUSINESS;
        break;
      case BroadcastTarget.FREE_BUSINESS:
        query = { profileType: ProfileType.BUSINESS, tier: UserTier.FREE };
        break;
      case BroadcastTarget.FLTRLITE_BASIC:
        query = { profileType: ProfileType.BUSINESS, tier: UserTier.BASIC };
        break;
      case BroadcastTarget.FLTRLITE_PRO:
        query = { profileType: ProfileType.BUSINESS, tier: UserTier.PRO };
        break;
    }

    const targetUsers = await this.userService.getUsers(query);
    const userCount = targetUsers.length;

    if (userCount === 0) {
      throw new BadRequestException('No users found');
    }

    // Prepare arrays in single pass
    const emails: string[] = [];
    const expoPushTokens: string[] = [];
    const recipientIds: string[] = [];

    for (let i = 0; i < userCount; i++) {
      const user = targetUsers[i];
      emails.push(user.email);
      if (user.expoPushToken) {
        expoPushTokens.push(user.expoPushToken);
      }
      recipientIds.push(user._id.toString());
    }

    // Send email or push notifications based on type
    if (input.type === BroadcastType.EMAIL) {
      await this.mailService.sendNotification(emails, input.title, input.content);
    } else if (input.type === BroadcastType.PUSH) {
      await this.sendExpoPushNotificationToUsers(
        expoPushTokens,
        input.title,
        input.content,
      );
    }

    await this.broadcastModel.create({
      type: input.type,
      target: input.target,
      title: input.title,
      content: input.content,
      sender: senderId,
      sentCount: userCount,
    });

    return userCount;
  }
}
