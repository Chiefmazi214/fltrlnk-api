import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { SubscriptionRepository } from './repositories/subscription.repository';
import {} from './models/subscription.model';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionPeriod,
  PromoCodeStatus,
} from './boost.enum';
import { RevenueCatWebhookEvent } from './dto/webhook.dto';
import { UserService } from 'src/user/user.service';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserTier } from 'src/user/user.enum';
import { Transaction, TransactionDocument } from './models/transactions.model';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionType } from './boost.enum';
import { PromoCode, PromoCodeDocument } from './models/promo-code.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(PromoCode.name)
    private readonly promoCodeModel: Model<PromoCodeDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async handleSubscriptionWebhook(event: RevenueCatWebhookEvent) {
    try {
      this.logger.log(
        `Processing subscription webhook: ${event.type} for user: ${event.app_user_id}`,
      );

      switch (event.type) {
        case 'INITIAL_PURCHASE':
          await this.handleInitialPurchase(event);
          break;

        case 'RENEWAL':
          await this.handleRenewal(event);
          break;

        case 'CANCELLATION':
          await this.handleCancellation(event);
          break;

        case 'EXPIRATION':
          await this.handleExpiration(event);
          break;

        case 'UNCANCELLATION':
          await this.handleUncancellation(event);
          break;

        case 'SUBSCRIPTION_PAUSED':
          await this.handleSubscriptionPaused(event);
          break;

        default:
          this.logger.warn(`Unhandled subscription event type: ${event.type}`);
      }

      await this.updateUserVerification(event.app_user_id);

      return { success: true, message: 'Subscription webhook processed' };
    } catch (error) {
      this.logger.error(
        `Error processing subscription webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleInitialPurchase(
    event: RevenueCatWebhookEvent,
    skipTransactionCreation = false,
  ) {
    const { subscriptionType, subscriptionPeriod } = this.parseProductId(
      event.product_id,
    );

    const renewalDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : null;

    await this.subscriptionRepository.create({
      revenueCatId: event.id,
      user: event.app_user_id,
      subscriptionType,
      subscriptionPeriod,
      startDate: new Date(event.purchased_at_ms),
      renewalDate,
      endDate: renewalDate,
      productId: event.product_id,
      willRenew: event.will_renew === false ? false : true,
    });

    if (!skipTransactionCreation) {
      await this.transactionModel.create({
        revenueCatId: event.id,
        user: event.app_user_id,
        amount: event.price,
        type: TransactionType.SUBSCRIPTION,
        subscriptionType: subscriptionType,
        date: new Date(event.purchased_at_ms),
        store: event.store,
        currency: event.currency,
        currencyAmount: event.price_in_purchased_currency,
      });
    }

    // Update user tier
    const tier =
      subscriptionType === SubscriptionType.BASIC
        ? UserTier.BASIC
        : UserTier.PRO;
    await this.userService.updateUser(event.app_user_id, { tier });

    await this.userService.markAsVerifiedBusinessUser(event.app_user_id);

    this.logger.log(
      `Initial purchase processed for user: ${event.app_user_id}`,
    );
  }

  async handleRenewal(event: RevenueCatWebhookEvent) {
    const subscription = await this.subscriptionRepository.findByUserId(
      event.app_user_id,
    );

    const { subscriptionType, subscriptionPeriod } = this.parseProductId(
      event.product_id,
    );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for renewal: ${event.app_user_id}`,
      );

      // create new subscription
      await this.subscriptionRepository.create({
        revenueCatId: event.id,
        user: event.app_user_id,
        subscriptionType,
        subscriptionPeriod,
        startDate: new Date(event.purchased_at_ms),
        renewalDate: event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null,
        endDate: event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null,
        productId: event.product_id,
        willRenew: true,
      });

      // Update user tier
      const tier =
        subscriptionType === SubscriptionType.BASIC
          ? UserTier.BASIC
          : UserTier.PRO;
      await this.userService.updateUser(event.app_user_id, { tier });
    }

    await this.transactionModel.create({
      revenueCatId: event.id,
      user: event.app_user_id,
      amount: event.price,
      type: TransactionType.SUBSCRIPTION,
      subscriptionType: subscriptionType,
      date: new Date(event.purchased_at_ms),
      store: event.store,
      currency: event.currency,
      currencyAmount: event.price_in_purchased_currency,
    });

    const renewalDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : null;

    await this.subscriptionRepository.update(event.app_user_id, {
      status: SubscriptionStatus.ACTIVE,
      renewalDate,
      willRenew: true,
    });

    await this.userService.markAsVerifiedBusinessUser(event.app_user_id);

    this.logger.log(`Renewal processed for subscription: ${event.app_user_id}`);
  }

  async handleCancellation(event: RevenueCatWebhookEvent) {
    const subscription = await this.subscriptionRepository.findByUserId(
      event.app_user_id,
    );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for cancellation: ${event.app_user_id}`,
      );
      return;
    }

    await this.subscriptionRepository.update(event.app_user_id, {
      status: SubscriptionStatus.CANCELLED,
      cancellationDate: new Date(event.event_timestamp_ms),
      endDate: new Date(event.event_timestamp_ms),
      willRenew: false,
    });

    await this.userService.markAsVerifiedBusinessUser(event.app_user_id);

    this.logger.log(
      `Cancellation processed for subscription: ${event.app_user_id}`,
    );
  }

  async handleExpiration(event: RevenueCatWebhookEvent) {
    const subscription = await this.subscriptionRepository.findByUserId(
      event.app_user_id,
    );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for expiration: ${event.app_user_id}`,
      );
      return;
    }

    await this.subscriptionRepository.update(event.app_user_id, {
      status: SubscriptionStatus.EXPIRED,
      expirationDate: new Date(
        event.expiration_at_ms || event.event_timestamp_ms,
      ),
      endDate: new Date(event.expiration_at_ms || event.event_timestamp_ms),
      willRenew: false,
    });

    await this.userService.updateUser(event.app_user_id, {
      tier: UserTier.FREE,
    });

    this.logger.log(
      `Expiration processed for subscription: ${event.app_user_id}`,
    );
  }

  async expireAllSubscriptions(userId: string) {
    await this.subscriptionRepository.updateAllByUserId(userId, {
      status: SubscriptionStatus.EXPIRED,
      expirationDate: new Date(Date.now()),
      endDate: new Date(Date.now()),
      willRenew: false,
    });

    await this.userService.updateUser(userId, {
      tier: UserTier.FREE,
    });
  }

  async handleUncancellation(event: RevenueCatWebhookEvent) {
    const subscription = await this.subscriptionRepository.findByUserId(
      event.app_user_id,
    );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for uncancellation: ${event.app_user_id}`,
      );
      return;
    }

    const renewalDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : null;

    await this.subscriptionRepository.update(event.app_user_id, {
      status: SubscriptionStatus.ACTIVE,
      cancellationDate: null,
      renewalDate,
      willRenew: true,
    });

    this.logger.log(
      `Uncancellation processed for subscription: ${event.app_user_id}`,
    );
  }

  async handleSubscriptionPaused(event: RevenueCatWebhookEvent) {
    const subscription = await this.subscriptionRepository.findByUserId(
      event.app_user_id,
    );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for pause: ${event.app_user_id}`,
      );
      return;
    }

    await this.subscriptionRepository.update(event.app_user_id, {
      status: SubscriptionStatus.PAUSED,
      willRenew: false,
    });

    this.logger.log(`Pause processed for subscription: ${event.app_user_id}`);
  }

  private parseProductId(productId: string): {
    subscriptionType: SubscriptionType;
    subscriptionPeriod: SubscriptionPeriod;
  } {
    const lower = productId?.toLowerCase() || '';

    let subscriptionType: SubscriptionType;
    if (lower.includes('basic')) {
      subscriptionType = SubscriptionType.BASIC;
    } else if (lower.includes('pro')) {
      subscriptionType = SubscriptionType.PRO;
    } else {
      throw new BadRequestException(
        `Unable to parse subscription type from product_id: ${productId}`,
      );
    }

    let subscriptionPeriod: SubscriptionPeriod;
    if (lower.includes('6') || lower.includes('six')) {
      subscriptionPeriod = SubscriptionPeriod.SIX_MONTHS;
    } else if (lower.includes('annual') || lower.includes('12')) {
      subscriptionPeriod = SubscriptionPeriod.ANNUAL;
    } else {
      subscriptionPeriod = SubscriptionPeriod.MONTHLY;
    }

    return { subscriptionType, subscriptionPeriod };
  }

  async updateUserVerification(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      return;
    }

    if (user.profileType === 'business') {
      const hasActiveSubscription =
        await this.subscriptionRepository.hasActiveSubscription(userId);

      if (hasActiveSubscription && !user.isVerified) {
        await this.userService.markAsVerifiedBusinessUser(userId);
        this.logger.log(`User verified: ${userId}`);
      } else if (!hasActiveSubscription && user.isVerified) {
        await this.userService.markAsUnverifiedUser(userId);
        this.logger.log(`User unverified: ${userId}`);
      }
    }
  }

  async getUserSubscriptions(userId: string) {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async getActiveSubscription(userId: string) {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    return this.subscriptionRepository.hasActiveSubscription(userId);
  }

  async applyPromoCode(userId: string, code: string) {
    const promoCode = await this.promoCodeModel.findOne({ code });
    if (!promoCode) {
      throw new NotFoundException('Invalid promo code');
    }

    if (promoCode.status === PromoCodeStatus.USED) {
      throw new BadRequestException('Promo code already used');
    }

    await this.subscriptionRepository.updateAllByUserId(userId, {
      status: SubscriptionStatus.EXPIRED,
      endDate: new Date(Date.now()),
      willRenew: false,
    });

    await this.subscriptionRepository.create({
      revenueCatId: promoCode.id,
      user: userId,
      subscriptionType: SubscriptionType.PRO,
      subscriptionPeriod: SubscriptionPeriod.ALL_TIME,
      startDate: new Date(),
      renewalDate: new Date(),
      productId: this.configService.get('REVENUECAT_PRO_PRODUCT_ID'),
      willRenew: false,
    });

    await this.userService.markAsVerifiedBusinessUser(userId);
    await this.userService.updateUser(userId, {
      tier: UserTier.PRO,
    });

    promoCode.status = PromoCodeStatus.USED;
    await promoCode.save();
  }

  // run cron job every day and check if endDate is in the past and status is active and update the status to expired and update the user tier to free
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const subscriptions = await this.subscriptionRepository.findAll({
      status: SubscriptionStatus.ACTIVE,
      endDate: { $lt: new Date() },
    });

    const userIds = subscriptions.map((subscription) =>
      subscription.user.toString(),
    );

    await this.subscriptionRepository.updateAll(
      { user: { $in: userIds } },
      {
        status: SubscriptionStatus.EXPIRED,
        endDate: new Date(Date.now()),
      },
    );
    await this.userService.updateByIds(userIds, {
      tier: UserTier.FREE,
    });
  }
}
