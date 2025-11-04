import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRevenueCatDto {
  @ApiProperty({
    description: 'Array of feature strings to update',
    example: ['unlimited_posts', 'premium_filters', 'ad_free', 'priority_support'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
