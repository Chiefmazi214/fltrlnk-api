import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SettingsRepositoryInterface } from './repositories/abstract/settings.repository-interface';
import { SettingsDocument } from './models/settings.model';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class SettingsService {
    constructor(
        @Inject(SettingsRepositoryInterface)
        private readonly settingsRepository: SettingsRepositoryInterface
    ) {}

    async getSettings(): Promise<SettingsDocument> {
        let settings = await this.settingsRepository.findSettings();

        if (!settings) {
            // Create default settings if none exist
            settings = await this.settingsRepository.create({
                siteName: 'FiltrLink Admin',
                sessionTimeout: 12,
                maxLoginAttempts: 5,
                require2FAForAllAdmins: false,
                allowNewAdminRegistration: true
            });
        }

        return settings;
    }

    async updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<SettingsDocument> {
        const settings = await this.getSettings();

        if (!settings) {
            throw new NotFoundException('Settings not found');
        }

        const updatedSettings = await this.settingsRepository.update(
            settings._id.toString(),
            updateSettingsDto
        );

        if (!updatedSettings) {
            throw new NotFoundException('Failed to update settings');
        }

        return updatedSettings;
    }
}
