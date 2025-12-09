import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DashboardStatsDto,
  MonthlyActiveUsersDto,
  NewUsersDto,
  SubscribersDto,
  RevenueDto,
  UserMatrixDto,
  RevenueMatrixDto,
} from './dtos/dashboard-stats.dto';
import { UserService } from 'src/user/user.service';
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
import { SweepstakesService } from './sweepstakes.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private readonly userService: UserService,
    private readonly sweepstakesService: SweepstakesService,
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

    const { progress: sweepstakesProgress, topStates: topStatesBySweepstakes } =
      await this.sweepstakesService.getSweepstakesDashboardStats();

    return {
      monthlyActiveUsers,
      newUsers,
      subscribers,
      revenue,
      sweepstakesProgress,
      topStatesBySweepstakes,
    };
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
