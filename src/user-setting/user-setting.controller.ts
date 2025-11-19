import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { UserSettingService } from './user-setting.service';
import { UpdateUserSettingDto } from './dtos/update-user-setting.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('user-settings')
@UseGuards(AuthGuard)
export class UserSettingController {
    constructor(private readonly userSettingService: UserSettingService) {}

    @Post()
    async updateUserSetting(
        @Body() updateUserSettingDto: UpdateUserSettingDto,
        @Req() req: Request
    ) {
        return this.userSettingService.upsertUserSetting(req.user._id, updateUserSettingDto);
    }

    @Get()
    async getUserSetting(@Req() req: Request) {
        return this.userSettingService.getAndCreateUserSettingByUserId(req.user._id);
    }
}
