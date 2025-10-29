import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserLocationDto {
  @IsString()
  @IsEnum(['Point'])
  type: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  coordinates: number[];
}

export class SocialLinksDto {
  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  instagram: string;

  @IsString()
  @IsOptional()
  tiktok: string;

  @IsString()
  @IsOptional()
  youtube: string;

  @IsString()
  @IsOptional()
  linkedin: string;

  @IsString()
  @IsOptional()
  facebook: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  displayName: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  profileType: string;

  @IsArray()
  @IsOptional()
  attributes: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserLocationDto)
  location: UpdateUserLocationDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social: SocialLinksDto;
}

export class ChangeBlockStatusInput {
  @ApiProperty({ description: 'Whether the user is blocked', example: true })
  @IsBoolean()
  blocked: boolean;
}
