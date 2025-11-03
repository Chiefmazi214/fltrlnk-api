import { BaseRepository } from 'src/common/repository/abstract/base.repository';
import { LikeDocument } from '../../models/like.model';
import { Types } from 'mongoose';

export const LikeRepositoryInterface = 'LikeRepositoryInterface';

export interface LikeRepositoryInterface extends BaseRepository<LikeDocument>  {
  dislike(filters: object): Promise<boolean>;
  hasLiked(userId: Types.ObjectId, targetUser: Types.ObjectId, type: string, targetId?: Types.ObjectId): Promise<boolean>;
}