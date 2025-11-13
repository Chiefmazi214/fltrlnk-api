import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateRevenueCatInput } from './dto/revenuecat.dto';
import { RevenueCat, RevenueCatDocument } from './models/revenuecat.model';
import {
  Boost,
  BoostDocument,
  SubscriptionStatus,
  PlanType,
} from './models/boost.model';
import { RevenueCatWebhookEvent } from './dto/webhook.dto';

@Injectable()
export class BoostService {
  private readonly logger = new Logger(BoostService.name);

  constructor(
    @InjectModel(RevenueCat.name)
    private readonly revenueCatModel: Model<RevenueCatDocument>,
    @InjectModel(Boost.name)
    private readonly boostModel: Model<BoostDocument>,
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

  // Webhook Handler
  async handleWebhook(event: RevenueCatWebhookEvent) {
    try {
      if (!event) {
        throw new BadRequestException('Invalid webhook payload');
      }

      this.logger.log(
        `Received webhook event: ${event.type} for user: ${event.app_user_id}`,
      );

      const userId = event.app_user_id;
      const productId = event.product_id;
      const subscriptionId = event.original_transaction_id;

      // Get the plan details from RevenueCat model
      const plan = await this.revenueCatModel.findOne({
        revenuecatId: productId,
      });

      if (!plan) {
        this.logger.warn(`Plan not found for product ID: ${productId}`);
        return { success: false, message: 'Plan not found' };
      }

      switch (event.type) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'NON_RENEWING_PURCHASE':
          await this.handleSubscriptionActivation(event, plan);
          break;

        case 'CANCELLATION':
          await this.handleSubscriptionCancellation(event);
          break;

        case 'UNCANCELLATION':
          await this.handleSubscriptionReactivation(event);
          break;

        case 'EXPIRATION':
          await this.handleSubscriptionExpiration(event);
          break;

        case 'BILLING_ISSUE':
          await this.handleBillingIssue(event);
          break;

        case 'SUBSCRIPTION_PAUSED':
          await this.handleSubscriptionPause(event);
          break;

        case 'PRODUCT_CHANGE':
          await this.handleProductChange(event, plan);
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

  private async handleSubscriptionActivation(
    event: RevenueCatWebhookEvent,
    plan: RevenueCatDocument,
  ) {
    const existingBoost = await this.boostModel.findOne({
      revenuecatSubscriptionId: event.original_transaction_id,
    });

    const boostData = {
      userId: event.app_user_id,
      revenuecatId: event.product_id,
      revenuecatSubscriptionId: event.original_transaction_id,
      status: SubscriptionStatus.ACTIVE,
      planType: this.determinePlanType(event.period_type),
      features: plan.features,
      startDate: new Date(event.purchased_at_ms),
      expirationDate: event.expiration_at_ms
        ? new Date(event.expiration_at_ms)
        : undefined,
      renewalDate: event.expiration_at_ms
        ? new Date(event.expiration_at_ms)
        : undefined,
      willRenew: true,
      isInTrialPeriod: event.offer_code.includes('trial') || false,
      lastWebhookEventType: event.type,
      lastWebhookReceivedAt: new Date(),
      metadata: {
        store: event.store,
        transactionId: event.transaction_id,
        countryCode: event.country_code,
        currency: event.currency,
        price: event.price,
      },
    };

    if (existingBoost) {
      await this.boostModel.findByIdAndUpdate(existingBoost._id, boostData);
      this.logger.log(
        `Updated active boost for subscription: ${event.original_transaction_id}`,
      );
    } else {
      await this.boostModel.create(boostData);
      this.logger.log(
        `Created new active boost for subscription: ${event.original_transaction_id}`,
      );
    }
  }

  private async handleSubscriptionCancellation(event: RevenueCatWebhookEvent) {
    await this.boostModel.findOneAndUpdate(
      { revenuecatSubscriptionId: event.original_transaction_id },
      {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        willRenew: false,
        lastWebhookEventType: event.type,
        lastWebhookReceivedAt: new Date(),
      },
    );
    this.logger.log(`Cancelled subscription: ${event.original_transaction_id}`);
  }

  private async handleSubscriptionReactivation(event: RevenueCatWebhookEvent) {
    await this.boostModel.findOneAndUpdate(
      { revenuecatSubscriptionId: event.original_transaction_id },
      {
        status: SubscriptionStatus.ACTIVE,
        cancelledAt: null,
        willRenew: true,
        lastWebhookEventType: event.type,
        lastWebhookReceivedAt: new Date(),
      },
    );
    this.logger.log(
      `Reactivated subscription: ${event.original_transaction_id}`,
    );
  }

  private async handleSubscriptionExpiration(event: RevenueCatWebhookEvent) {
    await this.boostModel.findOneAndUpdate(
      { revenuecatSubscriptionId: event.original_transaction_id },
      {
        status: SubscriptionStatus.EXPIRED,
        endDate: new Date(),
        lastWebhookEventType: event.type,
        lastWebhookReceivedAt: new Date(),
      },
    );
    this.logger.log(`Expired subscription: ${event.original_transaction_id}`);
  }

  private async handleBillingIssue(event: RevenueCatWebhookEvent) {
    await this.boostModel.findOneAndUpdate(
      { revenuecatSubscriptionId: event.original_transaction_id },
      {
        status: SubscriptionStatus.IN_BILLING_RETRY,
        lastWebhookEventType: event.type,
        lastWebhookReceivedAt: new Date(),
      },
    );
    this.logger.log(
      `Billing issue for subscription: ${event.original_transaction_id}`,
    );
  }

  private async handleSubscriptionPause(event: RevenueCatWebhookEvent) {
    await this.boostModel.findOneAndUpdate(
      { revenuecatSubscriptionId: event.original_transaction_id },
      {
        status: SubscriptionStatus.PAUSED,
        lastWebhookEventType: event.type,
        lastWebhookReceivedAt: new Date(),
      },
    );
    this.logger.log(`Paused subscription: ${event.original_transaction_id}`);
  }

  private async handleProductChange(
    event: RevenueCatWebhookEvent,
    newPlan: RevenueCatDocument,
  ) {
    await this.boostModel.findOneAndUpdate(
      { revenuecatSubscriptionId: event.original_transaction_id },
      {
        revenuecatId: event.product_id,
        features: newPlan.features,
        planType: this.determinePlanType(event.period_type),
        lastWebhookEventType: event.type,
        lastWebhookReceivedAt: new Date(),
      },
    );
    this.logger.log(
      `Product changed for subscription: ${event.original_transaction_id}`,
    );
  }

  private determinePlanType(periodType: string): PlanType {
    if (!periodType) return PlanType.ENTERPRISE;

    switch (periodType.toLowerCase()) {
      case 'monthly':
      case 'month':
        return PlanType.PRO;
      case 'yearly':
      case 'annual':
      case 'year':
        return PlanType.PREMIUM;
      default:
        return PlanType.ENTERPRISE;
    }
  }

  // Active Boost CRUD Operations
  async getUserActiveBoosts(userId: string) {
    return this.boostModel
      .find({
        userId,
        status: {
          $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.IN_GRACE_PERIOD],
        },
      })
      .populate('boostPlanId')
      .sort({ createdAt: -1 });
  }

  async getAllActiveBoosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [boosts, total] = await Promise.all([
      this.boostModel
        .find()
        .populate('revenuecatId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.boostModel.countDocuments(),
    ]);

    return {
      data: boosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActiveBoostBySubscriptionId(subscriptionId: string) {
    const boost = await this.boostModel
      .findOne({ revenuecatSubscriptionId: subscriptionId })
      .populate('revenuecatId');

    if (!boost) {
      throw new NotFoundException(
        `Active boost not found for subscription: ${subscriptionId}`,
      );
    }

    return boost;
  }

  async deleteActiveBoost(activeBoostId: string) {
    const boost = await this.boostModel.findByIdAndDelete(activeBoostId);

    if (!boost) {
      throw new NotFoundException(`Active boost not found: ${activeBoostId}`);
    }

    return { success: true, message: 'Active boost deleted successfully' };
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const activeBoost = await this.boostModel.findOne({
      userId,
      status: SubscriptionStatus.ACTIVE,
      $or: [
        { expirationDate: { $gt: new Date() } },
        { expirationDate: null }, // Lifetime subscriptions
      ],
    });

    return !!activeBoost;
  }

  // Get user's active features
  async getUserActiveFeatures(userId: string): Promise<string[]> {
    const activeBoosts = await this.boostModel.find({
      userId,
      status: SubscriptionStatus.ACTIVE,
      $or: [{ expirationDate: { $gt: new Date() } }, { expirationDate: null }],
    });

    // Merge all features from active subscriptions
    const features = new Set<string>();
    activeBoosts.forEach((boost) => {
      boost.features.forEach((feature) => features.add(feature));
    });

    return Array.from(features);
  }
}
