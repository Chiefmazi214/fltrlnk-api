import {
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RevenueCatEventType {
  INITIAL_PURCHASE = 'INITIAL_PURCHASE',
  RENEWAL = 'RENEWAL',
  CANCELLATION = 'CANCELLATION',
  UNCANCELLATION = 'UNCANCELLATION',
  NON_RENEWING_PURCHASE = 'NON_RENEWING_PURCHASE',
  SUBSCRIPTION_PAUSED = 'SUBSCRIPTION_PAUSED',
  EXPIRATION = 'EXPIRATION',
  BILLING_ISSUE = 'BILLING_ISSUE',
  PRODUCT_CHANGE = 'PRODUCT_CHANGE',
  TRANSFER = 'TRANSFER',
}

export class SubscriberAttributes {
  [key: string]: any;
}

export class ProductData {
  @IsString()
  product_id: string;

  @IsOptional()
  @IsString()
  entitlement_id?: string;

  @IsOptional()
  @IsString()
  period_type?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class SubscriptionData {
  @IsString()
  id: string;

  @IsString()
  store: string;

  @IsNumber()
  purchase_date_ms: number;

  @IsOptional()
  @IsNumber()
  expiration_date_ms?: number;

  @IsOptional()
  @IsNumber()
  renewal_date_ms?: number;

  @IsOptional()
  @IsBoolean()
  will_renew?: boolean;

  @IsOptional()
  @IsBoolean()
  is_trial_period?: boolean;

  @IsOptional()
  @IsNumber()
  trial_end_date_ms?: number;

  @IsOptional()
  @IsNumber()
  grace_period_expiration_date_ms?: number;

  @IsOptional()
  @IsBoolean()
  auto_resume?: boolean;

  @IsOptional()
  @IsString()
  product_id?: string;

  @IsOptional()
  @IsString()
  entitlement_id?: string;
}

export interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatWebhookEvent;
}

export interface RevenueCatWebhookEvent {
  aliases: string[];
  app_id: string;
  app_user_id: string;
  commission_percentage: number;
  country_code: string;
  currency: string;
  entitlement_id: string;
  entitlement_ids: string[];
  environment: 'PRODUCTION';
  event_timestamp_ms: number;
  expiration_at_ms: number;
  id: string;
  is_family_share: boolean;
  offer_code: string;
  original_app_user_id: string;
  original_transaction_id: string;
  period_type: string;
  presented_offering_id: string;
  price: number;
  price_in_purchased_currency: number;
  product_id: string;
  purchased_at_ms: number;
  store: string;
  subscriber_attributes: {
    [key: string]: {
      updated_at_ms: number;
      value: string;
    };
  };
  takehome_percentage: number;
  tax_percentage: number;
  transaction_id: string;
  type: string;
}

export class CreateActiveBoostDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  revenuecatId: string;

  @ApiProperty()
  @IsString()
  revenuecatSubscriptionId: string;

  @ApiProperty()
  @IsString()
  planType: string;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expirationDate?: Date;
}

export class UpdateActiveBoostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expirationDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  renewalDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  willRenew?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  features?: string[];
}
