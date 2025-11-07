import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from 'src/business/business.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
    @ApiProperty()
    @IsEnum(['users', 'all', ...Object.values(BusinessType)])
    type: 'users' | 'all' | BusinessType;

    @ApiProperty()
    @IsLatitude()
    @Type(() => Number)
    latitude: number;

    @ApiProperty()
    @IsLongitude()
    @Type(() => Number)
    longitude: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    mil?: number = 10;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    searchQuery?: string;
} 