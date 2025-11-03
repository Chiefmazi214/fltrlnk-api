import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { LikeRepositoryInterface } from './repositories/abstract/like.repository-interface';
import { NotificationService } from 'src/notification/notification.service';
import { Like } from './models/like.model';
import { NotificationType } from 'src/notification/models/notification.model';

@Injectable()
export class LikeService {
  constructor(
    @Inject(LikeRepositoryInterface)
    private readonly likeRepository: LikeRepositoryInterface,
    private readonly notificationService: NotificationService,
  ) {}

  async likeItem(
    userId: string,
    targetUserId: string,
    type: string,
    postId?: string,
  ): Promise<Like> {
    const existing = await this.likeRepository.findOne({
      user: new Types.ObjectId(userId),
      targetUser: new Types.ObjectId(targetUserId),
      type,
      postId: new Types.ObjectId(postId),
    });
    if (existing) {
      return existing;
    }

    const like = await this.likeRepository.create({
      user: new Types.ObjectId(userId),
      targetUser: new Types.ObjectId(targetUserId),
      type: type,
      post: new Types.ObjectId(postId),
    });

    const itemType = type === 'profile' ? 'profile' : 'post';
    await this.notificationService.createNotification({
      type: NotificationType.LIKE,
      message: `liked your ${itemType}`,
      recipientId: userId?.toString(),
      likeId: postId,
    });

    return like;
  }

  async unlikeItem(
    userId: string,
    targetUserId: string,
    type: string,
    postId?: string,
  ): Promise<boolean> {
    return this.likeRepository.dislike({
      $or: [
        {
          user: new Types.ObjectId(userId),
          targetUser: new Types.ObjectId(targetUserId),
        },
        {
          user: new Types.ObjectId(userId),
          post: new Types.ObjectId(postId),
        },
      ],
    });
  }

  async getLikes(targetId: string, type: string): Promise<Like[]> {
    return this.likeRepository.findAll({
      $or: [
        {
          targetUser: new Types.ObjectId(targetId),
          type,
        },
        {
          post: new Types.ObjectId(targetId),
          type,
        },
      ],
    });
  }

  async hasLiked(
    userId: string,
    targetUserId: string,
    type: string,
    postId?: string,
  ): Promise<boolean> {
    return this.likeRepository.hasLiked(
      new Types.ObjectId(userId),
      new Types.ObjectId(targetUserId),
      type,
      new Types.ObjectId(postId),
    );
  }
}
