import { Inject, Injectable } from '@nestjs/common';
import { UserSettingDocument } from './models/user-setting.model';
import { UserSettingRepositoryInterface } from './repositories/abstract/user-setting.repository-interface';
import { UpdateUserSettingDto } from './dtos/update-user-setting.dto';
import { Types } from 'mongoose';

@Injectable()
export class UserSettingService {
    constructor(
        @Inject(UserSettingRepositoryInterface)
        private readonly userSettingRepository: UserSettingRepositoryInterface
    ) {}

    // Helper to fill missing categorySetting fields with defaults
    private fillCategorySettingDefaults(input?: Partial<any>): any {
        return {
            individual: input?.individual ?? false,
            foodAndBeverage: input?.foodAndBeverage ?? false,
            entertainmentVenues: input?.entertainmentVenues ?? false,
            outdoorActivity: input?.outdoorActivity ?? false,
            nightLife: input?.nightLife ?? false,
        };
    }

    async getUserSettingById(id: string): Promise<UserSettingDocument> {
        return this.userSettingRepository.findById(id);
    }

    async getUserSettingByUserId(userId: string): Promise<UserSettingDocument> {
        return this.userSettingRepository.findByUserId(userId);
    }

    async createUserSetting(userSetting: Partial<UserSettingDocument>): Promise<UserSettingDocument> {
        return this.userSettingRepository.create(userSetting);
    }

    async updateUserSetting(id: string, userSetting: Partial<UserSettingDocument>): Promise<UserSettingDocument> {
        return this.userSettingRepository.update(id, userSetting);
    }

    async deleteUserSetting(id: string): Promise<void> {
        await this.userSettingRepository.delete(id);
    }

    async upsertUserSetting(userId: string, updateUserSettingDto: UpdateUserSettingDto): Promise<UserSettingDocument> {
        const existingSetting = await this.getUserSettingByUserId(userId);
        const categorySetting = this.fillCategorySettingDefaults(updateUserSettingDto.categorySetting);
        const lifestyleInfos = updateUserSettingDto.lifestyleInfos?.map(info => new Types.ObjectId(info)) ?? [];
        if (existingSetting) {
            return this.updateUserSetting(existingSetting._id.toString(), {
                ...updateUserSettingDto,
                user: new Types.ObjectId(userId),
                lifestyleInfos,
                categorySetting
            });
        }

        return this.createUserSetting({
            ...updateUserSettingDto,
            user: new Types.ObjectId(userId),
            lifestyleInfos,
            categorySetting
        });
    }

    async getAndCreateUserSettingByUserId(userId: string): Promise<UserSettingDocument> {
        let userSetting = await this.userSettingRepository.findByUserId(userId);
        if (!userSetting) {
            return await this.createUserSetting({
                user: new Types.ObjectId(userId),
                categorySetting: {
                    individual: false,
                    foodAndBeverage: false,
                    entertainmentVenues: false,
                    outdoorActivity: false,
                    nightLife: false
                },
                lifestyleInfos: [],
                isNotificationEnabled: false,
                isEmailNotificationEnabled: false,
            });
        }
        return userSetting;
    }
}
