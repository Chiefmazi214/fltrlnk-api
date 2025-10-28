import { IsString, IsOptional, IsObject, ValidateNested, IsPhoneNumber, IsUrl, IsNumber, IsBoolean } from "class-validator";
import { Type } from 'class-transformer';

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
    @IsString()
    @IsOptional()
    companyName: string;
    
    @IsOptional()
    @IsPhoneNumber()
    phone: string;

    @IsString()
    @IsOptional()
    @IsUrl()
    website: string;

    @IsString()
    @IsOptional()
    miniProfileBio: string;

    @IsString()
    @IsOptional()
    radarProfileBio: string;

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

    @IsNumber()
    @IsOptional()
    minPrice: number;

    @IsNumber()
    @IsOptional()
    maxPrice: number;

    @IsBoolean()
    @IsOptional()
    mapDiscovery: boolean;
}