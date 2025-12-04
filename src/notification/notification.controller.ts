import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationType } from './models/notification.model';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';
import { SendBroadcastDto } from './dtos/send-mass-message.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @UseGuards(AuthGuard)
  async getNotifications(
    @Req() req: Request,
    @Query('type') type?: NotificationType,
  ) {
    return this.notificationService.getNotificationsForUser(req.user._id, type);
  }

  @Patch('read/:notificationId')
  @UseGuards(AuthGuard)
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId as any);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: Request,
  ) {
    return this.notificationService.createNotification({
      ...createNotificationDto,
      actorId: req.user._id,
    });
  }

  @Post('broadcast')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  async createBroadcast(
    @Body() input: SendBroadcastDto,
    @Req() req: Request,
  ) {
    const count = await this.notificationService.sendBroadcast(input, req.user?._id);
    return { message: 'Broadcast sent successfully', count };
  }
}
