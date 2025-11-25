import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { ProfileType, UserStatus } from '../user.enum';

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

  @IsString()
  @IsOptional()
  external1: string;

  @IsString()
  @IsOptional()
  external2: string;

  @IsString()
  @IsOptional()
  external3: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfBirth: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profileType: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  attributes: string[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserLocationDto)
  location: UpdateUserLocationDto;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  biography: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social: SocialLinksDto;

  @ApiPropertyOptional()
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
  @ApiPropertyOptional({ description: 'The search query', example: 'John Doe' })
  @IsString()
  @IsOptional()
  searchQuery?: string;

  //email verified
  @ApiPropertyOptional({
    description: 'Whether the user is email verified',
    example: true,
  })
  @IsBooleanString()
  @IsOptional()
  emailVerified?: string;

  //phone verified
  @ApiPropertyOptional({
    description: 'Whether the user is phone verified',
    example: true,
  })
  @IsBooleanString()
  @IsOptional()
  phoneVerified?: string;

  //profile type
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(ProfileType)
  profileType?: string;

  //status
  @ApiPropertyOptional()
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  //tier (boost planType)
  @ApiPropertyOptional({
    description: 'The boost tier',
    example: 'premium',
    enum: ['pro', 'premium', 'enterprise']
  })
  @IsString()
  @IsOptional()
  tier?: string;
}

export class ChangeUserStatusInput {
  @ApiProperty({ description: 'The new status', example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status: UserStatus;
}