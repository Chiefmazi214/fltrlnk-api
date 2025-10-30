import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Colab, ColabDocument } from "src/chat/models/colab.model";
import { ColabRepositoryInterface } from "../abstract/colab.repository-interface";

export class ColabRepository extends MongooseRepositoryBase<ColabDocument> implements ColabRepositoryInterface {
    constructor(@InjectModel(Colab.name) private colabModel: Model<ColabDocument>) {
        super(colabModel);
    }
}
