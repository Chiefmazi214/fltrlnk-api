import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    @ApiBearerAuth()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Get application settings' })
    @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    @ApiBearerAuth()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Update application settings' })
    @ApiResponse({ status: 200, description: 'Settings updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Settings not found' })
    async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
        return this.settingsService.updateSettings(updateSettingsDto);
    }
}
