import {
  IsArray,
  IsBoolean,
  IsBooleanString,
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';

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

  @IsString()
  @IsOptional()
  expoPushToken: string;
}

export class ChangeBlockStatusInput {
  @ApiProperty({ description: 'Whether the user is blocked', example: true })
  @IsBoolean()
  blocked: boolean;
}

export class GetUsersWithPaginationQueryInput extends PaginationDto {
  @ApiProperty({ description: 'The search query', example: 'John Doe' })
  @IsString()
  @IsOptional()
  searchQuery?: string;

  //blocked
  @ApiProperty({ description: 'Whether the user is blocked', example: true })
  @IsBooleanString()
  @IsOptional()
  blocked?: string;

  //email verified
  @ApiProperty({
    description: 'Whether the user is email verified',
    example: true,
  })
  @IsBooleanString()
  @IsOptional()
  emailVerified?: string;

  //phone verified
  @ApiProperty({
    description: 'Whether the user is phone verified',
    example: true,
  })
  @IsBooleanString()
  @IsOptional()
  phoneVerified?: string;

  //profile type
  @ApiProperty({ description: 'The profile type', example: 'business' })
  @IsString()
  @IsOptional()
  profileType?: string;
}
