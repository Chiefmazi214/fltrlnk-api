import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionPeriod,
} from '../models/subscription.model';
import { RevenueCatWebhookEvent } from '../dto/webhook.dto';
import { UserService } from 'src/user/user.service';
import { Types } from 'mongoose';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userService: UserService,
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
          this.logger.warn(
            `Unhandled subscription event type: ${event.type}`,
          );
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

  private async handleInitialPurchase(event: RevenueCatWebhookEvent) {
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
      productId: event.product_id,
      willRenew: true,
    });

    await this.userService.markAsVerifiedBusinessUser(event.app_user_id);

    this.logger.log(
      `Initial purchase processed for user: ${event.app_user_id}`,
    );
  }

  private async handleRenewal(event: RevenueCatWebhookEvent) {
    const subscription = await this.subscriptionRepository.findByUserId(
      event.app_user_id,
    );

    if (!subscription) {
      this.logger.warn(
        `Subscription not found for renewal: ${event.app_user_id}`,
      );

      const { subscriptionType, subscriptionPeriod } = this.parseProductId(
        event.product_id,
      );

      // create new subscription
      await this.subscriptionRepository.create({
        revenueCatId: event.id,
        user: event.app_user_id,
        subscriptionType,
        subscriptionPeriod,
        startDate: new Date(event.purchased_at_ms),
        renewalDate: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
        productId: event.product_id,
        willRenew: true,
      });
    }

    const renewalDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : null;

    await this.subscriptionRepository.update(event.app_user_id, {
      status: SubscriptionStatus.ACTIVE,
      renewalDate,
      willRenew: true,
    });

    await this.userService.markAsVerifiedBusinessUser(event.app_user_id);

    this.logger.log(
      `Renewal processed for subscription: ${event.app_user_id}`,
    );
  }

  private async handleCancellation(event: RevenueCatWebhookEvent) {
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
      willRenew: false,
    });

    await this.userService.markAsVerifiedBusinessUser(event.app_user_id);

    this.logger.log(
      `Cancellation processed for subscription: ${event.app_user_id}`,
    );
  }

  private async handleExpiration(event: RevenueCatWebhookEvent) {
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
      expirationDate: new Date(event.expiration_at_ms || event.event_timestamp_ms),
      endDate: new Date(event.expiration_at_ms || event.event_timestamp_ms),
      willRenew: false,
    });

    this.logger.log(
      `Expiration processed for subscription: ${event.app_user_id}`,
    );
  }

  private async handleUncancellation(event: RevenueCatWebhookEvent) {
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

  private async handleSubscriptionPaused(event: RevenueCatWebhookEvent) {
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

    this.logger.log(
      `Pause processed for subscription: ${event.app_user_id}`,
    );
  }

  private parseProductId(productId: string): {
    subscriptionType: SubscriptionType;
    subscriptionPeriod: SubscriptionPeriod;
  } {
    const lower = productId.toLowerCase();

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

  private async updateUserVerification(userId: string) {
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
}
