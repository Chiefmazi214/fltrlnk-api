import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRevenueCatInput {
  @ApiPropertyOptional({
    description: 'Array of feature strings to update',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
