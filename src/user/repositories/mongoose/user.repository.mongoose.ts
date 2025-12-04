import { MongooseRepositoryBase } from 'src/common/repository/mongoose/mongoose.repository';
import { User, UserDocument } from '../../models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepositoryInterface } from '../abstract/user.repository-interface';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { PopulationOptions } from 'src/common/repository/abstract/base.repository';

export class UserRepository
  extends MongooseRepositoryBase<UserDocument>
  implements UserRepositoryInterface
{
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number,
    page: number,
    limit: number,
  ): Promise<{ data: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance * 1609.34, // Convert miles to meters
        },
      },
    };

    const [data, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query),
    ]);

    return { data, total };
  }

  async findWithPagination(
    filter: Record<string, any>,
    populate: PopulationOptions[],
    pagination: PaginationDto,
  ): Promise<{ data: UserDocument[]; total: number }> {
    const page = pagination.page ? +pagination.page : 1;
    const limit = pagination.limit ? +pagination.limit : 10;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate(populate)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findByUsername(
    username: string,
    populate?: PopulationOptions[],
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).populate(populate).exec();
  }

  async findByIdWithSelect(
    id: string,
    select?: string,
    populate?: PopulationOptions[],
  ): Promise<UserDocument | null> {
    let query = this.userModel.findById(id);
    if (populate) {
      query.populate(populate);
    }
    if (select) {
      query.select(select);
    }

    return query.exec();
  }

  async updateByIds(userIds: string[], user: Partial<UserDocument>) {
    const result = await this.userModel.updateMany({ _id: { $in: userIds } }, { $set: user }).exec();
    return result.modifiedCount || 0;
  }
}
