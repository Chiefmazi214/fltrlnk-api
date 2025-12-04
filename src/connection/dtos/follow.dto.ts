import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { FollowStatus } from "../like.enum";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "src/common/pagination/pagination.dto";

export class ChangeFollowStatusDto {
  @ApiProperty({ description: 'The status of the follow request' })
  @IsEnum(FollowStatus)
  @IsNotEmpty()
  status: FollowStatus;
}

export class GetFollowersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'The status of the followers' })
  @IsEnum(['all', ...Object.values(FollowStatus)])
  @IsOptional()
  status?: 'all' | FollowStatus = 'all';
}