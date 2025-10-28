import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { FollowRepositoryInterface } from './repositories/abstract/follow.repository-interface';
import { FollowDocument } from './models/follow.model';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/models/notification.model';

@Injectable()
export class FollowService {
    constructor(
        @Inject(FollowRepositoryInterface)
        private readonly followRepository: FollowRepositoryInterface,
        private readonly notificationService: NotificationService
    ) {}

    async followUser(userId: string, followingId: string): Promise<FollowDocument> {
        // Prevent self-following
        if (userId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        // Check if already following
        const existingFollow = await this.followRepository.findOne({
            follower: userId,
            following: followingId
        });

        if (existingFollow) {
            throw new BadRequestException('You are already following this user');
        }

        const follow = await this.followRepository.create({
            follower: userId,
            following: followingId
        }, [{ path: 'follower', select: 'username email profileImage' }, { path: 'following', select: 'username email profileImage' }]);
        await this.notificationService.createNotification({
            actorId: userId,
            recipientId: followingId,
            type: NotificationType.FOLLOW,
            message: `${userId} followed you`
        });
        return follow;
    }

    async unfollowUser(userId: string, followingId: string): Promise<FollowDocument> {
        // Prevent self-unfollow
        if (userId === followingId) {
            throw new BadRequestException('Invalid operation');
        }

        const follow = await this.followRepository.findOne({
            follower: userId,
            following: followingId
        }, [{ path: 'follower', select: 'username email profileImage' }, { path: 'following', select: 'username email profileImage' }]);
        
        if (!follow) {
            throw new BadRequestException('You are not following this user');
        }

        await this.followRepository.delete(follow._id.toString());
        return follow;
    }

    async getFollowers(userId: string, paginationDto: PaginationDto): Promise<PaginatedResultDto<FollowDocument>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [followers, total] = await Promise.all([
            this.followRepository.findAll(
                { following: userId },
                [{ path: 'follower', select: 'username email profileImage' }, { path: 'following', select: 'username email profileImage' }],
                { skip, limit }
            ),
            this.followRepository.count({ following: userId })
        ]);

        return {
            data: followers,
            total,
            page,
            limit
        };
    }

    async getFollowing(userId: string, paginationDto: PaginationDto): Promise<PaginatedResultDto<FollowDocument>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [following, total] = await Promise.all([
            this.followRepository.findAll(
                { follower: userId },
                [{ path: 'follower', select: 'username email profileImage' }, { path: 'following', select: 'username email profileImage' }],
                { skip, limit }
            ),
            this.followRepository.count({ follower: userId })
        ]);

        return {
            data: following,
            total,
            page,
            limit
        };
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const follow = await this.followRepository.findOne({
            follower: followerId,
            following: followingId
        });
        return !!follow;
    }

    async checkMultipleFollowers(targetUserId: string, userIds: string[]): Promise<{ userId: string; isFollowing: boolean }[]> {
        const followChecks = await Promise.all(
            userIds.map(async (userId) => {
                const isFollowing = await this.isFollowing(targetUserId, userId);
                return {
                    userId,
                    isFollowing
                };
            })
        );

        return followChecks;
    }
}
