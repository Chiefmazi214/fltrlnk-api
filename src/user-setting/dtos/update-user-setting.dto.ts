import { IsBoolean, IsObject, ValidateNested, IsOptional, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CategorySettingDto {
    @IsOptional()
    @IsBoolean()
    individual?: boolean;

    @IsOptional()
    @IsBoolean()
    foodAndBeverage?: boolean;

    @IsOptional()
    @IsBoolean()
    entertainmentVenues?: boolean;
    
    @IsOptional()
    @IsBoolean()
    outdoorActivity?: boolean;

    @IsOptional()
    @IsBoolean()
    nightLife?: boolean;
}

export class DiscoverySettingDto {
    @IsOptional()
    @IsBoolean()
    fltrScreen?: boolean;

    @IsOptional()
    @IsBoolean()
    stratosphereScreen?: boolean;
}
export class UpdateUserSettingDto {
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CategorySettingDto)
    categorySetting?: CategorySettingDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DiscoverySettingDto)
    discovery?: DiscoverySettingDto;

    @IsOptional()
    @IsBoolean()
    isNotificationEnabled?: boolean;

    @IsOptional()
    @IsBoolean()
    isEmailNotificationEnabled?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    lifestyleInfos?: string[];
} 