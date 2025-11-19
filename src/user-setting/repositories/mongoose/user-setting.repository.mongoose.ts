import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { UserSetting, UserSettingDocument } from "../../models/user-setting.model";
import { UserSettingRepositoryInterface } from "../abstract/user-setting.repository-interface";

export class UserSettingRepository extends MongooseRepositoryBase<UserSettingDocument> implements UserSettingRepositoryInterface {
    constructor(@InjectModel(UserSetting.name) private userSettingModel: Model<UserSettingDocument>) {
        super(userSettingModel);
    }

    async findByUserId(userId: string): Promise<UserSettingDocument> {
        return this.userSettingModel.findOne({ user: new Types.ObjectId(userId) }).exec();
    }
} 