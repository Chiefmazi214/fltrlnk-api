import {
  IsBoolean,
  IsObject,
  ValidateNested,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LifestyleInfoCategory } from '../models/user-setting.model';

export class CategorySettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  individual?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  foodAndBeverage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  entertainmentVenues?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  outdoorActivity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  nightLife?: boolean;
}

export class DiscoverySettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fltrScreen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  stratosphereScreen?: boolean;
}
export class UpdateUserSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CategorySettingDto)
  categorySetting?: CategorySettingDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DiscoverySettingDto)
  discovery?: DiscoverySettingDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isNotificationEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailNotificationEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEnum(LifestyleInfoCategory, { each: true })
  lifestyleInfos?: LifestyleInfoCategory[];
}
