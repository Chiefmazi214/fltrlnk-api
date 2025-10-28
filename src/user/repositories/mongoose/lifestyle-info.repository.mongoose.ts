import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { LifestyleInfo, LifestyleInfoDocument } from "src/user/models/lifestyle-info.model";
import { LifestyleInfoRepositoryInterface } from "../abstract/lifestyle-info.repository-interface";

export class LifestyleInfoRepository extends MongooseRepositoryBase<LifestyleInfoDocument> implements LifestyleInfoRepositoryInterface {
    constructor(@InjectModel(LifestyleInfo.name) private lifestyleInfoModel: Model<LifestyleInfoDocument>) {
        super(lifestyleInfoModel);
    }
}
