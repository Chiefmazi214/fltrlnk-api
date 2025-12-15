import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { FollowStatus, FollowStatusFilter } from "../like.enum";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "src/common/pagination/pagination.dto";
import { BusinessTypeFilter } from "src/business/business.enum";

export class ChangeFollowStatusDto {
  @ApiProperty({ description: 'The status of the follow request' })
  @IsEnum(FollowStatus)
  @IsNotEmpty()
  status: FollowStatus;
}

export class GetFollowersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'The status of the followers' })
  @IsEnum(FollowStatusFilter)
  @IsOptional()
  status?: FollowStatusFilter = FollowStatusFilter.ACCEPTED;

  @ApiPropertyOptional({ description: 'The business type of the followers' })
  @IsEnum(BusinessTypeFilter)
  @IsOptional()
  businessType?: BusinessTypeFilter
}