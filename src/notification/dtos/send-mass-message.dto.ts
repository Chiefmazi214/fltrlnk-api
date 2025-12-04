import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BroadcastTarget, BroadcastType } from '../notification.enum';

export class SendBroadcastDto {
  @ApiProperty({ enum: BroadcastType })
  @IsEnum(BroadcastType)
  type: BroadcastType;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ enum: BroadcastTarget })
  @IsEnum(BroadcastTarget)
  target: BroadcastTarget;
}
