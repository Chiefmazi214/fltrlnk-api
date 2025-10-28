import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../../models/notification.model';
import { NotificationRepositoryInterface } from '../abstract/notification.repository-interface';
import { MongooseRepositoryBase } from 'src/common/repository/mongoose/mongoose.repository';

@Injectable()
export class NotificationRepository extends MongooseRepositoryBase<NotificationDocument> implements NotificationRepositoryInterface {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {
      super(notificationModel);
  }

  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    return this.notificationModel.create(notification);
  }

  async getNotificationsForUser(userId: Types.ObjectId, type?: NotificationType): Promise<Notification[]> {
    const filter: any = { recipient: userId };
    if (type) filter.type = type;
    
    return this.notificationModel
      .find(filter)
      .populate('actor', 'name displayName username profileImage social.linkedin')
      .populate('recipient', 'displayName username profileImage')
      .populate({
        path: 'post',
        select: 'description attachments',
        populate: {
          path: 'attachments',
          model: 'Attachment'
        }
      })
      .populate('connection', 'message status')
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: Types.ObjectId): Promise<void> {
    await this.notificationModel.findByIdAndUpdate(notificationId, { $set: { read: true } });
  }

  async getSentConnectionRequests(userId: Types.ObjectId): Promise<Notification[]> {
    return this.notificationModel
      .find({ actor: userId, type: NotificationType.CONNECTION_REQUEST })
      .populate('recipient', 'name displayName username profileImage')
      .populate('connection', 'message status')
      .sort({ createdAt: -1 })
      .exec();
  }
} 