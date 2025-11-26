import { IsString, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionType, SubscriptionStatus, SubscriptionPeriod } from '../models/subscription.model';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsString()
  revenueCatId: string;

  @ApiProperty()
  @IsString()
  user: string

  @ApiProperty({ enum: SubscriptionType })
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;

  @ApiProperty({ enum: SubscriptionPeriod })
  @IsEnum(SubscriptionPeriod)
  subscriptionPeriod: SubscriptionPeriod;

  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  renewalDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  store?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  willRenew?: boolean;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  renewalDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  cancellationDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  expirationDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  willRenew?: boolean;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  revenueCatId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: SubscriptionType })
  subscriptionType: SubscriptionType;

  @ApiProperty({ enum: SubscriptionPeriod })
  subscriptionPeriod: SubscriptionPeriod;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  renewalDate?: Date;

  @ApiPropertyOptional()
  cancellationDate?: Date;

  @ApiPropertyOptional()
  expirationDate?: Date;
}
