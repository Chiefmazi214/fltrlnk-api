import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { IndividualService } from 'src/individual/individual.service';
import { BusinessService } from 'src/business/business.service';
import { SearchDto } from './dtos/search.dto';
import { SearchBusinessDto } from './dtos/search-business.dto';
import { SearchBusinessByNameDto } from './dtos/search-business-by-name.dto';
import { SearchIndividualDto } from './dtos/search-individual.dto';
import { SearchIndividualByNameDto } from './dtos/search-individual-by-name.dto';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { FollowService } from 'src/connection/follow.service';

@Injectable()
export class MapDiscoveryService {
  constructor(
    private readonly userService: UserService,
    private readonly individualService: IndividualService,
    private readonly businessService: BusinessService,
    private readonly followService: FollowService,
  ) {}

  async search(
    searchDto: SearchDto,
    requesterUserId?: string,
  ): Promise<PaginatedResultDto<any>> {
    const { type, latitude, longitude, mil, page = 1, limit = 10, searchQuery } = searchDto;
    console.log('Request Incoming Time ', new Date().toISOString());
    console.log('@1....i am calling from mobile side...', searchDto);

    let result: PaginatedResultDto<any>;
    if (type === 'users') {
      result = await this.individualService.findNearby(
        latitude,
        longitude,
        mil,
        page,
        limit,
        requesterUserId,
        searchQuery,
      );
      // Convert Mongoose documents to plain objects
      result.data = result.data.map((item: any) =>
        item.toObject ? item.toObject() : item,
      );
    } else if (type === 'all') {
      console.log('@2.1....', new Date().toISOString());
      console.log({
        page,
        limit,
      });

      // Fetch both individuals and businesses
      const [individualsResult, businessesResult] = await Promise.all([
        this.individualService.getIndividuals({ page, limit }, searchQuery),
        this.businessService.getBusinesses({ page, limit }, searchQuery),
      ]);

      // Combine the data from both results and convert to plain objects
      const combinedData = [
        ...individualsResult.data
          .filter((item: any) => item.user !== null)
          .map((item: any) => ({
            ...(item.toObject ? item.toObject() : item),
            type: 'individual',
          })),
        ...businessesResult.data
          .filter((item: any) => item.user !== null)
          .map((item: any) => ({
            ...(item.toObject ? item.toObject() : item),
            type: 'business',
          })),
      ];

      console.log(
        '@2....combinate data length ...',
        combinedData.length,
        new Date().toISOString(),
      );

      // Calculate combined pagination info
      const total = individualsResult.total + businessesResult.total;

      result = {
        data: combinedData,
        total,
        page,
        limit,
      };
    } else {
      console.log("@3... i am calling to fetch all data for ", type);
      result = await this.businessService.findNearby(
        latitude,
        longitude,
        mil,
        type,
        page,
        limit,
        searchQuery,
      );
      // Convert Mongoose documents to plain objects
      result.data = result.data.map((item: any) =>
        item.toObject ? item.toObject() : item,
      );
    }

    if (requesterUserId && result.data && result.data.length > 0) {
      const dataWithFollow = await Promise.all(
        result.data.map(async (item: any) => {
          const userId = item.user?._id?.toString();
          let isFollowed = false;
          if (userId && userId !== requesterUserId) {
            isFollowed = await this.followService.isFollowing(
              requesterUserId,
              userId,
            );
          }
          return { ...item, isFollowed };
        }),
      );
      result.data = dataWithFollow;
    }

    console.log(
      '@3....result...',
      result?.data?.length,
      new Date().toISOString(),
    );
    return result;
  }

  async searchBusiness(
    searchBusinessDto: SearchBusinessDto,
  ): Promise<PaginatedResultDto<any>> {
    const {
      name,
      latitude,
      longitude,
      mil,
      page = 1,
      limit = 10,
    } = searchBusinessDto;
    return this.businessService.findNearbyByName(
      latitude,
      longitude,
      mil,
      name,
      page,
      limit,
    );
  }

  async searchBusinessByName(
    searchBusinessByNameDto: SearchBusinessByNameDto,
  ): Promise<PaginatedResultDto<any>> {
    const { name, page = 1, limit = 10 } = searchBusinessByNameDto;
    return this.businessService.findByName(name, page, limit);
  }

  async searchIndividual(
    searchIndividualDto: SearchIndividualDto,
  ): Promise<PaginatedResultDto<any>> {
    const {
      name,
      latitude,
      longitude,
      mil,
      page = 1,
      limit = 10,
    } = searchIndividualDto;
    return this.individualService.findNearbyByName(
      latitude,
      longitude,
      mil,
      name,
      page,
      limit,
    );
  }

  async searchIndividualByName(
    searchIndividualByNameDto: SearchIndividualByNameDto,
  ): Promise<PaginatedResultDto<any>> {
    const { name, page = 1, limit = 10 } = searchIndividualByNameDto;
    return this.individualService.findByName(name, page, limit);
  }
}
