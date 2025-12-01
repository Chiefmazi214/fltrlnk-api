import {
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoostType } from '../boost.enum';

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

export class RevenueCatWebhookPayload {
  @ApiProperty()
  api_version: string;

  @ApiProperty()
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

// {
//   "aliases": [
//     "690e4c8acef93e20222f8a4e"
//   ],
//   "app_id": "appb4baf25504",
//   "app_user_id": "690e4c8acef93e20222f8a4e",
//   "commission_percentage": 0.3,
//   "country_code": "PK",
//   "currency": "PKR",
//   "entitlement_id": null,
//   "entitlement_ids": [
//     "boosts",
//     "boost_type",
//   ],
//   "renewal_number": null,
//   "store": "APP_STORE",
//   "subscriber_attributes": {
//     "$attConsentStatus": {
//       "updated_at_ms": 1764015722469,
//       "value": "denied"
//     }
//   },
//   "takehome_percentage": 0.7,
//   "tax_percentage": 0,
//   "transaction_id": "2000001064157032",
//   "type": "NON_RENEWING_PURCHASE"
// }

export class CreateActiveBoostDto {
  @ApiProperty()
  @IsEnum(BoostType)
  type: BoostType;

  @ApiProperty()
  @IsNumber()
  count: number;
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
