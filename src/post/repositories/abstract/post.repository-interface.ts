import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { PostDocument } from "src/post/models/post.model";

export const PostRepositoryInterface = 'PostRepositoryInterface';

export interface PostRepositoryInterface extends BaseRepository<PostDocument> {
}
