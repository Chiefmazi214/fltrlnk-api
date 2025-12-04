import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DashboardStatsDto,
  MonthlyActiveUsersDto,
  NewUsersDto,
  SubscribersDto,
  RevenueDto,
  SweepstakesProgressDto,
  StateEntryDto,
  SweepstakesProgressResponseDto,
  StateProgressDto,
  UserMatrixDto,
  RevenueMatrixDto,
} from './dtos/dashboard-stats.dto';
import { UserService } from 'src/user/user.service';
import { BusinessService } from 'src/business/business.service';
import { BoostService } from 'src/boost/boost.service';
import {
  SubscriptionType,
  SubscriptionStatus,
  TransactionType,
} from 'src/boost/boost.enum';
import { ProfileType, UserTier } from 'src/user/user.enum';
import { User, UserDocument } from 'src/user/models/user.model';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/boost/models/subscription.model';
import {
  Transaction,
  TransactionDocument,
} from 'src/boost/models/transactions.model';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private readonly userService: UserService,
    private readonly businessService: BusinessService,
    private readonly boostService: BoostService,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [
      totalUsers,
      newUsersTotal,
      newIndividualUsers,
      newBusinessUsers,
      subscribersTotal,
      subscribersBasic,
      subscribersPro,
    ] = await Promise.all([
      this.userService.countUsers({
        lastActionDate: { $gte: thirtyDaysAgo },
      }),
      this.userService.countUsers({ createdAt: { $gte: sevenDaysAgo } }),
      this.userService.countUsers({
        createdAt: { $gte: sevenDaysAgo },
        profileType: ProfileType.INDIVIDUAL,
      }),
      this.userService.countUsers({
        createdAt: { $gte: sevenDaysAgo },
        profileType: ProfileType.BUSINESS,
      }),
      this.subscriptionModel.countDocuments({
        status: SubscriptionStatus.ACTIVE,
      }),
      this.subscriptionModel.countDocuments({
        status: SubscriptionStatus.ACTIVE,
        subscriptionType: SubscriptionType.BASIC,
      }),
      this.subscriptionModel.countDocuments({
        status: SubscriptionStatus.ACTIVE,
        subscriptionType: SubscriptionType.PRO,
      }),
    ]);

    const monthlyActiveUsers: MonthlyActiveUsersDto = {
      total: totalUsers,
      WAU: Math.floor(totalUsers * 0.4),
      DAU: Math.floor(totalUsers * 0.1),
    };

    const newUsers: NewUsersDto = {
      total: newUsersTotal,
      individual: newIndividualUsers,
      business: newBusinessUsers,
    };

    const subscribers: SubscribersDto = {
      total: subscribersTotal,
      basic: subscribersBasic,
      pro: subscribersPro,
    };

    const revenueData = await this.transactionModel.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          boostRevenue: {
            $sum: {
              $cond: {
                if: { $eq: ['$type', TransactionType.BOOST] },
                then: '$amount',
                else: 0,
              },
            },
          },
          basicRevenue: {
            $sum: {
              $cond: {
                if: { $eq: ['$subscriptionType', SubscriptionType.BASIC] },
                then: '$amount',
                else: 0,
              },
            },
          },
          proRevenue: {
            $sum: {
              $cond: {
                if: { $eq: ['$subscriptionType', SubscriptionType.PRO] },
                then: '$amount',
                else: 0,
              },
            },
          },
        },
      },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const revenue: RevenueDto = {
      total: Math.round(totalRevenue * 100) / 100,
      boost: revenueData.length > 0 ? revenueData[0].boostRevenue : 0,
      basic: revenueData.length > 0 ? revenueData[0].basicRevenue : 0,
      pro: revenueData.length > 0 ? revenueData[0].proRevenue : 0,
    };

    // TODO: make it dynamic
    const sweepstakesProgress: SweepstakesProgressDto = {
      current: 0,
      goal: 5000,
      percentage: '0%',
    };

    const topStatesBySweepstakes: StateEntryDto[] =
      this.getTopStatesBySweepstakes();

    return {
      monthlyActiveUsers,
      newUsers,
      subscribers,
      revenue,
      sweepstakesProgress,
      topStatesBySweepstakes,
    };
  }

  getSweepstakesProgress(): SweepstakesProgressResponseDto {
    // TODO: Mock data, to be replaced with real aggregation later
    const states: StateProgressDto[] = [
      { state: 'CA', entries: 12500, percentage: 62.5, goal: 10000 },
      { state: 'TX', entries: 8500, percentage: 85.0, goal: 5000 },
      { state: 'FL', entries: 3200, percentage: 64.0, goal: 1000 },
      { state: 'NY', entries: 2800, percentage: 56.0, goal: 1000 },
      { state: 'IL', entries: 1500, percentage: 30.0, goal: 1000 },
      { state: 'PA', entries: 1200, percentage: 24.0, goal: 1000 },
      { state: 'OH', entries: 950, percentage: 95.0, goal: 1000 },
      { state: 'GA', entries: 750, percentage: 75.0, goal: 1000 },
      { state: 'NC', entries: 600, percentage: 60.0, goal: 1000 },
      { state: 'MI', entries: 450, percentage: 45.0, goal: 1000 },
    ];

    return {
      title: 'Sweepstakes Progress by State',
      subtitle: 'State-level milestone tracking',
      states,
    };
  }

  getTopStatesBySweepstakes(): StateEntryDto[] {
    // TODO: Mock data, to be replaced with real aggregation later
    return [
      { state: 'CA', entries: 201 },
      { state: 'NY', entries: 173 },
      { state: 'TX', entries: 144 },
      { state: 'FL', entries: 109 },
      { state: 'IL', entries: 93 },
    ];
  }

  async getUserMatrix(): Promise<UserMatrixDto> {
    const [totalUsers, paidUsers, totalBusinesses] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel
        .countDocuments({ tier: { $in: [UserTier.BASIC, UserTier.PRO] } })
        .exec(),
      this.userModel.countDocuments({ profileType: 'business' }).exec(),
    ]);

    return {
      totalUsers,
      paidUsers,
      totalBusinesses,
    };
  }

  async getRevenueMatrix(): Promise<RevenueMatrixDto> {
    const totalRevenue = await this.transactionModel.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageOrderValue: { $avg: '$amount' },
        },
      },
    ]);

    return {
      totalRevenue: Math.round(totalRevenue[0]?.totalRevenue * 100) / 100,
      totalTransactions: totalRevenue[0]?.totalTransactions,
      averageOrderValue:
        Math.round(totalRevenue[0]?.averageOrderValue * 100) / 100,
    };
  }

  async getUserGraphData() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate users by date for the last 30 days
    const usersByDate = await this.userModel.aggregate([
      {
        $facet: {
          totalUsers: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          activeUsers: [
            {
              $match: {
                lastActionDate: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$lastActionDate',
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          paidUsers: [
            {
              $match: {
                tier: { $in: ['Basic', 'Pro'] },
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          businessUsers: [
            {
              $match: {
                profileType: 'business',
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          individualUsers: [
            {
              $match: {
                profileType: 'individual',
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    // Get cumulative total users
    const totalUsersCount = await this.userModel.countDocuments().exec();

    return {
      newUsers: usersByDate[0]?.totalUsers.map((d) => ({
        date: d?._id,
        count: d?.count,
      })),
      activeUsers: usersByDate[0]?.activeUsers.map((d) => ({
        date: d?._id,
        count: d?.count,
      })),
      paidUsers: usersByDate[0]?.paidUsers.map((d) => ({
        date: d?._id,
        count: d?.count,
      })),
      businessUsers: usersByDate[0]?.businessUsers.map((d) => ({
        date: d?._id,
        count: d?.count,
      })),
      individualUsers: usersByDate[0]?.individualUsers.map((d) => ({
        date: d?._id,
        count: d?.count,
      })),
      totalUsers: totalUsersCount,
    };
  }

  async getRevenueGraphData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use transaction model to fetch data for the last 30 days
    const revenueByDate = await this.transactionModel.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return revenueByDate.map((d) => ({
      date: d._id,
      revenue: Math.round(d.revenue * 100) / 100,
      transactions: d.transactions,
    }));
  }
}
