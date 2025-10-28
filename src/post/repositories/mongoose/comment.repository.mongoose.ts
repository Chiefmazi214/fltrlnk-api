import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { CommentRepositoryInterface } from "src/post/repositories/abstract/comment.repository-interface";
import { Comment, CommentDocument } from "src/post/models/comment.model";

export class CommentRepository extends MongooseRepositoryBase<CommentDocument> implements CommentRepositoryInterface {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {
        super(commentModel);
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return this.commentModel.aggregate(pipeline).exec();
    }
}
