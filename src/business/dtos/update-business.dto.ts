import { IsString, IsOptional, IsObject, ValidateNested, IsPhoneNumber, IsUrl, IsNumber, IsBoolean, IsEnum } from "class-validator";
import { Type } from 'class-transformer';
import { BusinessType } from "../business.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class WorkingHoursDto {
    @IsString()
    @IsOptional()
    open: string;

    @IsString()
    @IsOptional()
    close: string;

    @IsOptional()
    isClosed: boolean;
}

export class UpdateBusinessDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    companyName: string;

    @ApiPropertyOptional()
    @IsEnum(BusinessType)
    @IsOptional()
    businessType: BusinessType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    category: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    state: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    niche: string;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsPhoneNumber()
    phone: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsUrl()
    website: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    miniProfileBio: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    radarProfileBio: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => WorkingHoursDto)
    workingHours: {
        monday?: WorkingHoursDto;
        tuesday?: WorkingHoursDto;
        wednesday?: WorkingHoursDto;
        thursday?: WorkingHoursDto;
        friday?: WorkingHoursDto;
        saturday?: WorkingHoursDto;
        sunday?: WorkingHoursDto;
    };

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    minPrice: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    maxPrice: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    mapDiscovery: boolean;
}