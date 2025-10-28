import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Follow, FollowDocument } from "src/connection/models/follow.model";
import { FollowRepositoryInterface } from "../abstract/follow.repository-interface";

export class FollowRepository extends MongooseRepositoryBase<FollowDocument> implements FollowRepositoryInterface {
    constructor(@InjectModel(Follow.name) private followModel: Model<FollowDocument>) {
        super(followModel);
    }
}
