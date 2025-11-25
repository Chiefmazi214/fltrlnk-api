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
import { UserService } from 'src/user/user.service';

@Injectable()
export class BoostService {
  private readonly logger = new Logger(BoostService.name);

  constructor(
    private readonly userService: UserService,
    @InjectModel(RevenueCat.name)
    private readonly revenueCatModel: Model<RevenueCatDocument>,
    @InjectModel(Boost.name)
    private readonly boostModel: Model<BoostDocument>,
    @InjectModel(ActiveBoost.name)
    private readonly activeBoostModel: Model<ActiveBoostDocument>,
  ) {}

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

  async boostPurchase(event: RevenueCatWebhookEvent) {
    let [count, type] = event.entitlement_ids; // type is boost_type (lnk, match, gps, loc, users, search)

    const userId = event.app_user_id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!count || !type) {
      throw new BadRequestException('Invalid entitlement ids');
    }

    const countNumber = Number(count);
    if (isNaN(countNumber)) {
      throw new BadRequestException('Invalid count number');
    }

    if (!Object.values(BoostType).includes(type as BoostType)) {
      throw new BadRequestException('Invalid type');
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

    await this.userService.markAsVerifiedUser(userId);
  }
}
