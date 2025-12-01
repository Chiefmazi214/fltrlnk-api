import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../models/notification.model';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    name: 'recipientId',
    description: 'ID of the notification recipient',
  })
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @ApiProperty({
    name: 'type',
    description: 'Type of the notification',
    enum: NotificationType,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  commentText?: string;

  @IsOptional()
  @IsString()
  connectionId?: string;

  @IsOptional()
  @IsString()
  colabId?: string;


  @IsOptional()
  @IsString()
  likeId?: string;


  @IsOptional()
  @IsString()
  followId?: string;


  @ApiPropertyOptional({ name: 'message', description: 'Notification message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ name: 'title', description: 'Notification title' })
  @IsOptional()
  @IsString()
  title?: string;
}
