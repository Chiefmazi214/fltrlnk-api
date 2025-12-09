// sweepstakes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/models/user.model';
import {
  Subscription,
  SubscriptionDocument,
} from '../boost/models/subscription.model';
import { Follow, FollowDocument } from '../connection/models/follow.model';
import { SubscriptionStatus, SubscriptionType } from '../boost/boost.enum';
import { FollowStatus } from '../connection/like.enum';
import {
  SweepstakesDashboardDto,
  SweepstakesProgressDto,
  StateEntryDto,
  TopInviterDto,
} from './dtos/dashboard-stats.dto';

@Injectable()
export class SweepstakesService {
  // yahan se sweepstakes config aa raha hai (simple constants)
  private readonly GOAL = 5000; // 5k Pro “subscribers”
  private readonly ACTIVATION_DEADLINE = new Date('2026-07-20T23:59:59.999Z');

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,

    @InjectModel(Follow.name)
    private readonly followModel: Model<FollowDocument>,
  ) {}

  async getSweepstakesDashboardStats(): Promise<SweepstakesDashboardDto> {
    const [progress, topStatesBySweepstakes, topInviters] = await Promise.all([
      this.getSweepstakesProgress(),
      this.getTopStatesBySweepstakes(5),
      this.getTopInviters(20),
    ]);

    return {
      progress,
      topStates: topStatesBySweepstakes,
      topInviters,
    };
  }

  /**
   * Total active Pro subscribers
   * Assumption: 1 user → 1 active subscription max
   */
  private async getTotalProSubscribers(): Promise<number> {
    return this.subscriptionModel.countDocuments({
      status: SubscriptionStatus.ACTIVE,
      subscriptionType: SubscriptionType.PRO,
    });
  }

  /**
   * Nationwide sweepstakes progress
   */
  private async getSweepstakesProgress(): Promise<SweepstakesProgressDto> {
    const current = await this.getTotalProSubscribers();
    const goal = this.GOAL;
    const percentage = this.calculatePercentage(current, goal);
    const isActivated = this.checkActivationCondition(current);

    return {
      current,
      goal,
      percentage,
      isActivated,
    };
  }

  private calculatePercentage(current: number, goal: number): string {
    if (!goal || goal <= 0) return '0%';

    const raw = (current / goal) * 100;
    const clamped = Math.min(100, Math.max(0, Math.round(raw)));
    return `${clamped}%`;
  }

  /**
   * Activation condition:
   * - 5000 Pro subscribers
   * - before / on July 20, 2026
   */
  private checkActivationCondition(current: number): boolean {
    const now = new Date();
    if (now > this.ACTIVATION_DEADLINE) return false;
    return current >= this.GOAL;
  }

  /**
   * Top LNK Challenge – Top states by Pro subscribers
   * - Only users with active Pro subscription
   * - Group by businessState
   */
  async getTopStatesBySweepstakes(limit = 5): Promise<StateEntryDto[]> {
    // 1) Pro subscriptions → userIds
    const proSubs = await this.subscriptionModel.find(
      {
        status: SubscriptionStatus.ACTIVE,
        subscriptionType: SubscriptionType.PRO,
      },
      { user: 1 },
    );

    const proUserIds = proSubs.map((s) => s.user) as Types.ObjectId[];
    if (!proUserIds.length) return [];

    // 2) Users (only Pro users) grouped by businessState
    const agg = await this.userModel.aggregate([
      {
        $match: {
          _id: { $in: proUserIds },
          businessState: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$businessState',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return agg.map((r) => ({
      state: r._id,
      count: r.count,
    }));
  }

  /**
   * Top Invite Challenge – Top inviters
   *
   * Logic:
   * - invited user = User jiska referralUsername set hai
   * - qualifying invited user = has active Pro subscription
   * - group invited Pro users by referralUsername
   */
  async getTopInviters(limit = 20): Promise<TopInviterDto[]> {
    // 1) all active Pro subscriptions
    const proSubs = await this.subscriptionModel.find(
      {
        status: SubscriptionStatus.ACTIVE,
        subscriptionType: SubscriptionType.PRO,
      },
      { user: 1 },
    );

    const proUserIds = proSubs.map((s) => s.user) as Types.ObjectId[];
    if (!proUserIds.length) return [];

    // 2) among Pro users, check their referralUsername
    const agg = await this.userModel.aggregate([
      {
        $match: {
          _id: { $in: proUserIds },
          referralUsername: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$referralUsername', // inviter's username
          invitedCount: { $sum: 1 }, // number of Pro users they invited
        },
      },
      {
        $sort: { invitedCount: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    if (!agg.length) return [];

    // 3) ensure inviters actually exist as users
    const inviterUsernames = agg.map((a) => a._id);
    const inviters = await this.userModel.find(
      { username: { $in: inviterUsernames } },
      { username: 1 },
    );

    const inviterSet = new Set(inviters.map((u) => u.username));

    const result: TopInviterDto[] = agg
      .filter((a) => inviterSet.has(a._id))
      .map((a) => ({
        username: a._id,
        invitedCount: a.invitedCount,
      }));

    return result;
  }

  /**
   * OPTIONAL helper:
   * Top followed Pro creators (followers-based ranking)
   * – use if you want “most followed Pro businesses” somewhere
   */
  async getTopFollowedProUsers(
    limit = 20,
  ): Promise<{ userId: string; followers: number }[]> {
    const proSubs = await this.subscriptionModel.find(
      {
        status: SubscriptionStatus.ACTIVE,
        subscriptionType: SubscriptionType.PRO,
      },
      { user: 1 },
    );

    const proUserIds = proSubs.map((s) => s.user) as Types.ObjectId[];
    if (!proUserIds.length) return [];

    const agg = await this.followModel.aggregate([
      {
        $match: {
          following: { $in: proUserIds },
          status: FollowStatus.ACCEPTED,
        },
      },
      {
        $group: {
          _id: '$following',
          followers: { $sum: 1 },
        },
      },
      {
        $sort: { followers: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return agg.map((a) => ({
      userId: a._id.toString(),
      followers: a.followers,
    }));
  }
}
