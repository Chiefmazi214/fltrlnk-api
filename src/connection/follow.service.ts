import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { FollowRepositoryInterface } from './repositories/abstract/follow.repository-interface';
import { FollowDocument } from './models/follow.model';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/models/notification.model';
import { FollowStatus } from './like.enum';
import { GetFollowersQueryDto } from './dtos/follow.dto';
import { Types } from 'mongoose';
import { BusinessTypeFilter } from 'src/business/business.enum';
import { ProfileType } from 'src/user/user.enum';

@Injectable()
export class FollowService {
  constructor(
    @Inject(FollowRepositoryInterface)
    private readonly followRepository: FollowRepositoryInterface,
    private readonly notificationService: NotificationService,
  ) {}

  async followUser(
    userId: string,
    followingId: string,
    status: FollowStatus = FollowStatus.PENDING,
  ): Promise<FollowDocument> {
    if (userId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.followRepository.findOne({
      follower: userId,
      following: followingId,
    });

    if (existingFollow) {
      throw new BadRequestException('You are already following this user');
    }

    const follow = await this.followRepository.create(
      {
        follower: new Types.ObjectId(userId),
        following: new Types.ObjectId(followingId),
        status,
      },
      [
        { path: 'follower', select: 'username email profileImage' },
        { path: 'following', select: 'username email profileImage' },
      ],
    );

    await this.notificationService.createNotification({
      actorId: userId,
      recipientId: followingId,
      type: NotificationType.FOLLOW,
      message: `${userId} followed you`,
    });

    return follow;
  }

  async changeFollowStatus(
    userId: string,
    followId: string,
    status: FollowStatus,
  ): Promise<FollowDocument> {
    const follow = await this.followRepository.findOne({
      _id: followId,
      following: userId,
    });
    if (!follow) {
      throw new BadRequestException('You are not following this user');
    }

    follow.status = status;
    await follow.save();

    if (status === FollowStatus.ACCEPTED) {
      await this.notificationService.createNotification({
        actorId: userId,
        recipientId: follow?.follower?.toString(),
        type: NotificationType.FOLLOW,
        message: `${userId} accepted your follow request`,
      });
    }

    return follow;
  }

  async unfollowUser(
    userId: string,
    followingId: string,
  ): Promise<FollowDocument> {
    // Prevent self-unfollow
    if (userId === followingId) {
      throw new BadRequestException('Invalid operation');
    }

    const follow = await this.followRepository.findOne(
      {
        follower: userId,
        following: followingId,
      },
      [
        { path: 'follower', select: 'username email profileImage' },
        { path: 'following', select: 'username email profileImage' },
      ],
    );

    if (!follow) {
      throw new BadRequestException('You are not following this user');
    }

    await this.followRepository.delete(follow._id.toString());
    return follow;
  }

  async getFollowers(
    userId: string,
    input: GetFollowersQueryDto,
  ): Promise<PaginatedResultDto<FollowDocument>> {
    const { page = 1, limit = 10, status = 'all', businessType } = input;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      following: new Types.ObjectId(userId),
      ...(status !== 'all' ? { status } : {}),
    };

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'follower',
          foreignField: '_id',
          as: 'followerUser',
        },
      },
      { $unwind: '$followerUser' },
    ];

    if (businessType && businessType !== BusinessTypeFilter.ALL && businessType !== BusinessTypeFilter.USERS) {
      pipeline.push({
        $match: {
          'followerUser.businessType': businessType,
        },
      });
    }

    if (businessType && businessType === BusinessTypeFilter.USERS) {
      pipeline.push({
        $match: {
          'followerUser.profileType': ProfileType.INDIVIDUAL,
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'followingUser',
        },
      },
      { $unwind: '$followingUser' },
      {
        $project: {
          _id: 1,
          follower: {
            _id: '$followerUser._id',
            username: '$followerUser.username',
            email: '$followerUser.email',
            profileImage: '$followerUser.profileImage',
            businessType: '$followerUser.businessType',
          },
          following: {
            _id: '$followingUser._id',
            username: '$followingUser.username',
            email: '$followingUser.email',
            profileImage: '$followingUser.profileImage',
            businessType: '$followingUser.businessType',
          },
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    );

    const [followers, countResult] = await Promise.all([
      this.followRepository.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
      ]),
      this.followRepository.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data: followers,
      total,
      page,
      limit,
    };
  }

  async getFollowing(
    userId: string,
    input: GetFollowersQueryDto,
  ): Promise<PaginatedResultDto<FollowDocument>> {
    const { page = 1, limit = 10, status, businessType } = input;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      follower: new Types.ObjectId(userId),
      ...(status !== 'all' ? { status } : {}),
    };

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'followingUser',
        },
      },
      { $unwind: '$followingUser' },
    ];

    if (businessType && businessType !== BusinessTypeFilter.ALL && businessType !== BusinessTypeFilter.USERS) {
      pipeline.push({
        $match: {
          'followingUser.businessType': businessType,
        },
      });
    }
    if (businessType && businessType === BusinessTypeFilter.USERS) {
      pipeline.push({
        $match: {
          'followingUser.profileType': ProfileType.INDIVIDUAL,
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'follower',
          foreignField: '_id',
          as: 'followerUser',
        },
      },
      { $unwind: '$followerUser' },
      {
        $project: {
          _id: 1,
          follower: {
            _id: '$followerUser._id',
            username: '$followerUser.username',
            email: '$followerUser.email',
            profileImage: '$followerUser.profileImage',
          },
          following: {
            _id: '$followingUser._id',
            username: '$followingUser.username',
            email: '$followingUser.email',
            profileImage: '$followingUser.profileImage',
            businessType: '$followingUser.businessType',
          },
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    );

    const [following, totalResult] = await Promise.all([
      this.followRepository.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
      ]),
      this.followRepository.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    return {
      data: following,
      total,
      page,
      limit,
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      follower: followerId,
      following: followingId,
    });
    return !!follow;
  }

  async checkMultipleFollowers(
    targetUserId: string,
    userIds: string[],
  ): Promise<{ userId: string; isFollowing: boolean }[]> {
    const followChecks = await Promise.all(
      userIds.map(async (userId) => {
        const isFollowing = await this.isFollowing(targetUserId, userId);
        return {
          userId,
          isFollowing,
        };
      }),
    );

    return followChecks;
  }
}
