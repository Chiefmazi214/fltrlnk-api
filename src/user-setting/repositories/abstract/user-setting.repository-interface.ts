import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { UserSettingDocument } from "../../models/user-setting.model";

export const UserSettingRepositoryInterface = 'UserSettingRepositoryInterface';

export interface UserSettingRepositoryInterface extends BaseRepository<UserSettingDocument> {
    findByUserId(userId: string): Promise<UserSettingDocument>;
} 