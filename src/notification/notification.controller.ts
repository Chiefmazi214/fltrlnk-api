import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationType } from './models/notification.model';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getNotifications(
    @Req() req: Request,
    @Query('type') type?: NotificationType
  ) {
    return this.notificationService.getNotificationsForUser(req.user._id, type);
  }

  @Patch('read/:notificationId')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId as any);
  }
}
