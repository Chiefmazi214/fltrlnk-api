// sweepstakes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/models/user.model';
import {
  Subscription,
  SubscriptionDocument,
} from '../boost/models/subscription.model';
import { SubscriptionStatus, SubscriptionType } from '../boost/boost.enum';
import {
  SweepstakesDashboardDto,
  SweepstakesProgressDto,
  StateEntryDto,
  TopInviterDto,
} from './dtos/dashboard-stats.dto';

@Injectable()
export class SweepstakesService {
  private readonly GOAL = 5000; // 5k Pro “subscribers”
  private readonly ACTIVATION_DEADLINE = new Date('2026-07-20T23:59:59.999Z');

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
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

  private async getTotalProSubscribers(): Promise<number> {
    return this.subscriptionModel.countDocuments({
      subscriptionType: SubscriptionType.PRO,
    });
  }

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

  private checkActivationCondition(current: number): boolean {
    const now = new Date();
    if (now > this.ACTIVATION_DEADLINE) return false;
    return current >= this.GOAL;
  }

  async getTopStatesBySweepstakes(limit = 5): Promise<StateEntryDto[]> {
    const proSubs = await this.subscriptionModel.find(
      {
        subscriptionType: SubscriptionType.PRO,
      },
      { user: 1 },
    );

    const proUserIds = proSubs.map((s) => s.user) as Types.ObjectId[];
    if (!proUserIds.length) return [];

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

  async getTopInviters(limit = 20): Promise<TopInviterDto[]> {
    const proSubs = await this.subscriptionModel.find(
      {
        subscriptionType: SubscriptionType.PRO,
      },
      { user: 1 },
    );

    const proUserIds = proSubs.map((s) => s.user) as Types.ObjectId[];
    if (!proUserIds.length) return [];

    const agg = await this.userModel.aggregate([
      {
        $match: {
          _id: { $in: proUserIds },
          referralUsername: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$referralUsername',
          invitedCount: { $sum: 1 },
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

    const inviterUsernames = agg.map((a) => a._id);
    const inviters = await this.userModel.find(
      { username: { $in: inviterUsernames } },
      { username: 1, displayName: 1, email: 1, profileImage: 1 },
    );

    const inviterSet = new Set(inviters.map((u) => u.username));

    const result: TopInviterDto[] = agg
      .filter((a) => inviterSet.has(a._id))
      .map((a) => ({
        user: {
          displayName: inviters.find((u) => u.username === a._id)?.displayName || '',
          email: inviters.find((u) => u.username === a._id)?.email || '',
          username: inviters.find((u) => u.username === a._id)?.username || '',
          imageUrl: inviters.find((u) => u.username === a._id)?.profileImage?.url || '',
        },
        invitedCount: a.invitedCount,
      }));

    return result;
  }
}
