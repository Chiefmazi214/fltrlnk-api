import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { LikeRepositoryInterface } from './repositories/abstract/like.repository-interface';
import { NotificationService } from 'src/notification/notification.service';
import { Like } from './models/like.model';
import { NotificationType } from 'src/notification/models/notification.model';
import { LikeType } from './like.enum';

@Injectable()
export class LikeService {
  constructor(
    @Inject(LikeRepositoryInterface)
    private readonly likeRepository: LikeRepositoryInterface,
    private readonly notificationService: NotificationService,
  ) {}

  async likeItem(
    userId: string,
    type: LikeType,
    targetId?: string,
  ): Promise<Like> {
    const existing = await this.likeRepository.findOne({
      user: new Types.ObjectId(userId),
      [type === LikeType.PROFILE ? 'targetUser' : 'post']: new Types.ObjectId(targetId),
      type,
    });
    if (existing) {
      return existing;
    }

    const like = await this.likeRepository.create({
      user: new Types.ObjectId(userId),
      [type === LikeType.PROFILE ? 'targetUser' : 'post']: new Types.ObjectId(targetId),
      type: type,
    });

    await this.notificationService.createNotification({
      type: NotificationType.LIKE,
      message: `liked your ${type}`,
      recipientId: userId?.toString(),
      likeId: like._id.toString(),
    });

    return like;
  }

  async unlikeItem(
    userId: string,
    type: LikeType,
    targetId?: string,
  ): Promise<boolean> {
    return this.likeRepository.dislike({
      $or: [
        {
          user: new Types.ObjectId(userId),
          [type === LikeType.PROFILE ? 'targetUser' : 'post']: new Types.ObjectId(targetId),
        },
        {
          user: new Types.ObjectId(userId),
          [type === LikeType.PROFILE ? 'targetUser' : 'post']: new Types.ObjectId(targetId),
        },
      ],
    });
  }

  async getLikes(targetId: string, type: LikeType): Promise<Like[]> {
    return this.likeRepository.findAll({
      $or: [
        {
          targetUser: new Types.ObjectId(targetId),
          type: LikeType.PROFILE,
        },
        {
          post: new Types.ObjectId(targetId),
          type: LikeType.POST,
        },
      ],
    });
  }

  async hasLiked(
    userId: string,
    targetId: string,
    type: LikeType,
  ): Promise<boolean> {
    return this.likeRepository.hasLiked(
      new Types.ObjectId(userId),
      type,
      new Types.ObjectId(targetId),
    );
  }
}
