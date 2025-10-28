import { IsString, IsOptional, IsObject, ValidateNested, IsNumber, IsBoolean } from "class-validator";
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

export class CreateBusinessDto {
    @IsString()
    @IsOptional()
    companyName: string;
    
    @IsString()
    @IsOptional()
    phone: string;

    @IsString()
    @IsOptional()
    website: string;

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