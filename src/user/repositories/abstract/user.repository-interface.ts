import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  BaseRepository,
  PopulationOptions,
} from 'src/common/repository/abstract/base.repository';
import { UserDocument } from 'src/user/models/user.model';

export const UserRepositoryInterface = 'UserRepositoryInterface';

export interface UserRepositoryInterface extends BaseRepository<UserDocument> {
  findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number,
    page: number,
    limit: number,
  ): Promise<{ data: UserDocument[]; total: number }>;
  findWithPagination(
    filter: Record<string, any>,
    populate: PopulationOptions[],
    pagination: PaginationDto,
  ): Promise<{ data: UserDocument[]; total: number }>;
  findByUsername(username: string, populate?: PopulationOptions[]): Promise<UserDocument | null>;
  findByIdWithSelect(id: string, select?: string, populate?: PopulationOptions[]): Promise<UserDocument | null>;
}
