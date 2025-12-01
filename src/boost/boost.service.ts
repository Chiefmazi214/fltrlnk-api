import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateRevenueCatInput } from './dto/revenuecat.dto';
import { RevenueCat, RevenueCatDocument } from './models/revenuecat.model';
import { Boost, BoostDocument } from './models/boost.model';
import {
  CreateActiveBoostDto,
  RevenueCatWebhookEvent,
} from './dto/webhook.dto';
import { ActiveBoost, ActiveBoostDocument } from './models/active-boost.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActiveBoostStatus, BoostType } from './boost.enum';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from './models/subscription.model';

@Injectable()
export class BoostService {
  private readonly logger = new Logger(BoostService.name);

  constructor(
    @InjectModel(RevenueCat.name)
    private readonly revenueCatModel: Model<RevenueCatDocument>,
    @InjectModel(Boost.name)
    private readonly boostModel: Model<BoostDocument>,
    @InjectModel(ActiveBoost.name)
    private readonly activeBoostModel: Model<ActiveBoostDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  async deleteRevenueCat(revenuecatId: string) {
    return this.revenueCatModel.findOneAndDelete({ revenuecatId });
  }

  async getRevenueCatById(revenuecatId: string) {
    return this.revenueCatModel.findOne({ revenuecatId });
  }

  async updateRevenueCatFeatures(
    revenuecatId: string,
    updateRevenueCatDto: UpdateRevenueCatInput,
  ) {
    const revenueCat = await this.revenueCatModel.findOneAndUpdate(
      { revenuecatId },
      { features: updateRevenueCatDto.features },
      { new: true, runValidators: true, upsert: true },
    );

    return revenueCat;
  }

  async getAllPlans() {
    return this.revenueCatModel.find();
  }

  async createActiveBoost(userId: string, input: CreateActiveBoostDto) {
    const boost = await this.boostModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!boost) {
      throw new BadRequestException('User does not have any boosts');
    }

    if (boost.boosts?.[input.type] < input.count) {
      throw new BadRequestException('User does not have enough boosts');
    }

    await this.activeBoostModel.create({
      user: new Types.ObjectId(userId),
      type: input.type,
      count: input.count,
      startDate: new Date(),
    });

    boost.boosts[input.type] -= input.count;
    await boost.save();

    return {
      message: 'Active boost created successfully',
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await this.activeBoostModel.updateMany(
      {
        status: ActiveBoostStatus.ACTIVE,
        startDate: { $lte: twoHoursAgo },
      },
      { status: ActiveBoostStatus.INACTIVE },
    );
  }

  @Cron('0 0 1 * *')
  async addMonthlyBoostsForSubscribers() {
    try {
      this.logger.log('Starting monthly boost addition for subscribed users');

      const activeSubscriptions = await this.subscriptionModel.find({
        status: SubscriptionStatus.ACTIVE,
      });

      this.logger.log(
        `Found ${activeSubscriptions.length} active subscriptions`,
      );

      let successCount = 0;
      let failCount = 0;

      for (const subscription of activeSubscriptions) {
        try {
          const userId = subscription.user;

          const boost = await this.boostModel.findOne({ user: userId });

          if (!boost) {
            await this.boostModel.create({
              user: userId,
              boosts: {
                fltr: 0,
                lnk: 0,
                match: 0,
                gps: 0,
                users: 5,
                search: 0,
                loc: 0,
              },
            });
          } else {
            boost.boosts.users += 5;
            await boost.save();
          }

          successCount++;
        } catch (error) {
          failCount++;
          this.logger.error(
            `Failed to add boosts for subscription ${subscription._id}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `Monthly boost addition completed. Success: ${successCount}, Failed: ${failCount}`,
      );

      return {
        success: true,
        processed: activeSubscriptions.length,
      };
    } catch (error) {
      this.logger.error(
        `Error in monthly boost addition: ${error.message}`,
        error.stack,
      );
    }
  }

  // Webhook Handler
  async handleWebhook(event: RevenueCatWebhookEvent) {
    try {
      if (!event) {
        throw new BadRequestException('Invalid webhook payload');
      }

      this.logger.log(
        `Received webhook event: ${event.type} for user: ${event.app_user_id}`,
      );

      switch (event.type) {
        case 'NON_RENEWING_PURCHASE':
          await this.boostPurchase(event);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserBoosts(userId: string) {
    return this.boostModel.find({ user: new Types.ObjectId(userId) });
  }

  async useBoost(userId: string, type: string, count: number) {
    return this.boostModel.updateOne(
      { user: new Types.ObjectId(userId) },
      { $inc: { boosts: { [type]: -count } } },
    );
  }

  // get active boost
  async getActiveBoost(userId: string, type: BoostType) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    return this.activeBoostModel
      .findOne({
        user: new Types.ObjectId(userId),
        startDate: { $gte: twoHoursAgo },
        type: type,
        count: { $gt: 0 },
      })
      .sort({ _id: -1 })
      .limit(1)
      .select('count');
  }

  async assignReferralBoost(userId: string, referralUserId?: string) {
    if (referralUserId) {
      const referralUserBoosts = await this.boostModel.findOne({
        user: new Types.ObjectId(referralUserId),
      });
      if (!referralUserBoosts) {
        await this.boostModel.create({
          user: new Types.ObjectId(referralUserId),
          boosts: { users: 35 },
        });
      } else {
        referralUserBoosts.boosts.users += 35;
        await referralUserBoosts.save();
      }
    }

    const userBoosts = await this.boostModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!userBoosts) {
      await this.boostModel.create({
        user: new Types.ObjectId(userId),
        boosts: { users: 35 },
      });
    } else {
      userBoosts.boosts.users += 35;
      await userBoosts.save();
    }
  }

  parseProductId(productId: string) {
    const regex = /^([a-z]+)(?:_(\d+))?_boosts$/;

    const match = productId.match(regex);

    if (!match) {
      throw new BadRequestException('Invalid product id format');
    }

    const [, type, count] = match;

    const validTypes = Object.values(BoostType);
    if (!validTypes.includes(type as BoostType)) {
      throw new BadRequestException('Invalid boost type');
    }

    return {
      type: type as BoostType,
      count: count ? parseInt(count, 10) : 1,
    };
  }

  async boostPurchase(event: RevenueCatWebhookEvent) {
    const { count, type } = this.parseProductId(event.product_id);

    const userId = event.app_user_id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!count || !type) {
      throw new BadRequestException('Invalid product id');
    }

    const countNumber = Number(count);
    if (isNaN(countNumber)) {
      throw new BadRequestException('Invalid count number');
    }

    if (!Object.values(BoostType).includes(type as BoostType)) {
      throw new BadRequestException('Invalid boost type');
    }

    const boosts = await this.boostModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!boosts) {
      await this.boostModel.create({
        user: new Types.ObjectId(userId),
        boosts: { [type]: countNumber },
      });
    } else {
      boosts.boosts[type] += countNumber;
      await boosts.save();
    }
  }
}
