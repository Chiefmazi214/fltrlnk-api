import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Attachment, AttachmentDocument } from "../../models/attachment.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AttachmentRepositoryInterface } from "../abstract/attachment.repository-interface";

export class AttachmentRepository extends MongooseRepositoryBase<AttachmentDocument> implements AttachmentRepositoryInterface {
    constructor(@InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>) {
        super(attachmentModel);
    }
}   