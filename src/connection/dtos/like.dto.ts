import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CommonParams } from 'src/common/dtos/common.dtos';
import { LikeType } from '../like.enum';

export class LikeParams extends CommonParams {
  @ApiProperty({ description: 'The type of the entity' })
  @IsEnum(LikeType)
  @IsNotEmpty()
  type: LikeType;
}
