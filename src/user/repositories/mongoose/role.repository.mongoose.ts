import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Role, RoleDocument } from "src/user/models/role.model";
import { RoleRepositoryInterface } from "../abstract/role.repository-interface";

export class RoleRepository extends MongooseRepositoryBase<RoleDocument> implements RoleRepositoryInterface {
    constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {
        super(roleModel);
    }
}
