import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CommonParams } from 'src/common/dtos/common.dtos';

export class LikeParams extends CommonParams {
  @ApiProperty({ description: 'The ID of the entity' })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;
}
