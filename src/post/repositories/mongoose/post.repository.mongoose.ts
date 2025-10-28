import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Post, PostDocument } from "src/post/models/post.model";
import { PostRepositoryInterface } from "../abstract/post.repository-interface";

export class PostRepository extends MongooseRepositoryBase<PostDocument> implements PostRepositoryInterface {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
        super(postModel);
    }
}
