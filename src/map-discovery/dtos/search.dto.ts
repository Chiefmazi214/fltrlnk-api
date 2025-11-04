import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from 'src/business/business.enum';

export class SearchDto {
    @IsEnum(['users', 'all', ...Object.values(BusinessType)])
    type: 'users' | 'all' | BusinessType;

    @IsLatitude()
    @Type(() => Number)
    latitude: number;

    @IsLongitude()
    @Type(() => Number)
    longitude: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    mil?: number = 10;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number;
} 