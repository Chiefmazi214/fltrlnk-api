import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeType } from '../like.enum';

export class LikeInput {
  @ApiProperty({ description: 'The type of the entity' })
  @IsEnum(LikeType)
  @IsNotEmpty()
  type: LikeType;
}
