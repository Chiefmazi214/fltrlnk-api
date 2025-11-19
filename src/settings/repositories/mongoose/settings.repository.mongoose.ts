import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Settings, SettingsDocument } from "src/settings/models/settings.model";
import { SettingsRepositoryInterface } from "../abstract/settings.repository-interface";

@Injectable()
export class SettingsRepository extends MongooseRepositoryBase<SettingsDocument> implements SettingsRepositoryInterface {
    constructor(@InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>) {
        super(settingsModel);
    }

    async findSettings(): Promise<SettingsDocument | null> {
        return this.settingsModel.findOne().exec();
    }
}
