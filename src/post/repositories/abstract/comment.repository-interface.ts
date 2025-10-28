import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { CommentDocument } from "src/post/models/comment.model";

export const CommentRepositoryInterface = 'CommentRepositoryInterface';

export interface CommentRepositoryInterface extends BaseRepository<CommentDocument> {
    aggregate(pipeline: any[]): Promise<any[]>;
}
