import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { SettingsDocument } from "src/settings/models/settings.model";

export const SettingsRepositoryInterface = 'SettingsRepositoryInterface';

export interface SettingsRepositoryInterface extends BaseRepository<SettingsDocument> {
    findSettings(): Promise<SettingsDocument | null>;
}
