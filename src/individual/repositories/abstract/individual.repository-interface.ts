import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { IndividualDocument } from "src/individual/models/individual.model";
import { Individual } from '../../models/individual.model';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';

export const IndividualRepositoryInterface = 'IndividualRepositoryInterface';

export interface IndividualRepositoryInterface extends BaseRepository<IndividualDocument> {
    aggregate(pipeline: any[]): Promise<any[]>;
    findNearby(latitude: number, longitude: number, maxDistance: number, page: number, limit: number, searchQuery?: string): Promise<PaginatedResultDto<Individual>>;
    findNearbyByName(latitude: number, longitude: number, maxDistance: number, name: string, page: number, limit: number): Promise<PaginatedResultDto<Individual>>;
    findByName(name: string, page: number, limit: number): Promise<PaginatedResultDto<Individual>>;
    getAll(page: number, limit: number, searchQuery?: string): Promise<PaginatedResultDto<Individual>>;
}
