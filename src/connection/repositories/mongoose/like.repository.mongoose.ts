import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Like, LikeDocument } from '../../models/like.model';
import { LikeRepositoryInterface } from '../abstract/like.repository-interface';
import { MongooseRepositoryBase } from 'src/common/repository/mongoose/mongoose.repository';
import { LikeType } from 'src/connection/like.enum';

@Injectable()
export class LikeRepository
  extends MongooseRepositoryBase<LikeDocument>
  implements LikeRepositoryInterface
{
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {
    super(likeModel);
  }

  async dislike(filters: object) {
    const like = await this.likeModel.findOneAndDelete({
      ...filters,
    });

    return !!like;
  }

  async hasLiked(
    userId: Types.ObjectId,
    type: LikeType,
    targetId?: Types.ObjectId,
  ): Promise<boolean> {
    const like = await this.findOne({
      user: userId,
      [type === LikeType.PROFILE ? 'targetUser' : 'post']: targetId,
      type,
    });
    return !!like;
  }
}
