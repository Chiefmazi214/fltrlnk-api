import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRevenueCatDto {
  @ApiProperty({
    description: 'Unique RevenueCat plan identifier',
    example: 'rc_monthly_premium',
  })
  @IsString()
  @IsNotEmpty()
  revenuecatId: string;

  @ApiProperty({
    description: 'Array of feature strings associated with this plan',
    example: ['unlimited_posts', 'premium_filters', 'ad_free'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];
}
