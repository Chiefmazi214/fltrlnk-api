import { BaseRepository } from 'src/common/repository/abstract/base.repository';
import { BusinessDocument } from 'src/business/models/business.model';

export const BusinessRepositoryInterface = 'BusinessRepositoryInterface';

export interface BusinessRepositoryInterface
  extends BaseRepository<BusinessDocument> {
  findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number,
    businessType: string | null,
    page: number,
    limit: number,
    searchQuery?: string,
  ): Promise<{ data: BusinessDocument[]; total: number }>;
  findNearbyByName(
    latitude: number,
    longitude: number,
    maxDistance: number,
    name: string,
    page: number,
    limit: number,
  ): Promise<{ data: BusinessDocument[]; total: number }>;
  findByName(
    name: string,
    page: number,
    limit: number,
  ): Promise<{ data: BusinessDocument[]; total: number }>;
  getAll(
    page: number,
    limit: number,
    searchQuery?: string,
  ): Promise<{ data: BusinessDocument[]; total: number }>;
}
