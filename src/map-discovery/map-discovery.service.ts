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
import { BoostService } from 'src/boost/boost.service';
import { BoostType } from 'src/boost/boost.enum';

@Injectable()
export class MapDiscoveryService {
  constructor(
    private readonly userService: UserService,
    private readonly individualService: IndividualService,
    private readonly businessService: BusinessService,
    private readonly followService: FollowService,
    private readonly boostService: BoostService,
  ) {}

  async search(
    searchDto: SearchDto,
    requesterUserId?: string,
  ): Promise<PaginatedResultDto<any>> {
    const { type, latitude, longitude, mil, page = 1, limit = 10, searchQuery } = searchDto;
    console.log('Request Incoming Time ', new Date().toISOString());
    console.log('@1....i am calling from mobile side...', searchDto);

    const businessTypes = type.split(',');
    let result: PaginatedResultDto<any>;

    // Check for active boosts if user is authenticated
    let locationBoost = null;
    let gpsBoost = null;
    let searchBoost = null;

    if (requesterUserId) {
      [locationBoost, gpsBoost, searchBoost] = await Promise.all([
        this.boostService.getActiveBoost(requesterUserId, BoostType.LOC),
        this.boostService.getActiveBoost(requesterUserId, BoostType.GPS),
        this.boostService.getActiveBoost(requesterUserId, BoostType.SEARCH),
      ]);
    }

    // LocationBoost: Show boosted profiles when lat, long, and mil are selected
    if (locationBoost && locationBoost.count > 0 && latitude && longitude && mil) {
      const boostedProfiles = await this.getBoostedProfiles(BoostType.LOC, latitude, longitude, mil);
      result = {
        data: boostedProfiles,
        total: boostedProfiles.length,
        page,
        limit,
      };
    }
    // GPSBoost: Show boosted profiles within 100 miles when lat, long are selected
    else if (gpsBoost && gpsBoost.count > 0 && latitude && longitude) {
      const boostedProfiles = await this.getBoostedProfiles(BoostType.GPS, latitude, longitude, 100);
      result = {
        data: boostedProfiles,
        total: boostedProfiles.length,
        page,
        limit,
      };
    }
    // Regular search logic
    else if (type === 'users') {
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

      // Fetch both individuals and businesses using location-based filtering
      const [individualsResult, businessesResult] = await Promise.all([
        this.individualService.findNearby(
          latitude,
          longitude,
          mil,
          page,
          limit,
          requesterUserId,
          searchQuery,
        ),
        this.businessService.findNearby(
          latitude,
          longitude,
          mil,
          null, // null businessType means get all business types
          page,
          limit,
          searchQuery,
        ),
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
        businessTypes,
        page,
        limit,
        searchQuery,
      );
      // Convert Mongoose documents to plain objects
      result.data = result.data.map((item: any) =>
        item.toObject ? item.toObject() : item,
      );

      // SearchBoost: Prioritize profiles with active search boosts when searching for business types
      if (searchBoost && searchBoost.count > 0 && type !== 'users' && type !== 'all') {
        const boostedBusinesses = await this.getBoostedBusinessesByType(businessTypes);
        if (boostedBusinesses.length > 0) {
          // Remove duplicates and put boosted profiles on top
          const boostedIds = new Set(boostedBusinesses.map((b: any) => b._id.toString()));
          const nonBoostedData = result.data.filter((item: any) => !boostedIds.has(item._id.toString()));
          result.data = [...boostedBusinesses, ...nonBoostedData];
        }
      }
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

  private async getBoostedProfiles(
    boostType: BoostType,
    latitude: number,
    longitude: number,
    maxDistance: number,
  ): Promise<any[]> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Find all users with active boosts of this type
    const boostedIndividuals = await this.individualService['individualRepository'].aggregate([
      {
        $lookup: {
          from: 'activeboosts',
          localField: 'user',
          foreignField: 'user',
          as: 'activeBoosts',
        },
      },
      {
        $match: {
          'activeBoosts.type': boostType,
          'activeBoosts.count': { $gt: 0 },
          'activeBoosts.startDate': { $gte: twoHoursAgo },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $match: {
          'user.location': {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], maxDistance / 3963.2],
            },
          },
        },
      },
      {
        $addFields: {
          boostCount: { $arrayElemAt: ['$activeBoosts.count', 0] },
        },
      },
      {
        $sort: { boostCount: -1 },
      },
      {
        $project: {
          _id: 1,
          biography: 1,
          fltrlScreen: 1,
          createdAt: 1,
          updatedAt: 1,
          'user._id': 1,
          'user.username': 1,
          'user.email': 1,
          'user.profileImage': 1,
          'user.attributes': 1,
          'user.displayName': 1,
          'user.location': 1,
          'user.lifestyleInfo': 1,
          'user.isOnline': 1,
          boostCount: 1,
        },
      },
    ]);

    const boostedBusinesses = await this.businessService['businessRepository'].aggregate([
      {
        $lookup: {
          from: 'activeboosts',
          localField: 'user',
          foreignField: 'user',
          as: 'activeBoosts',
        },
      },
      {
        $match: {
          'activeBoosts.type': boostType,
          'activeBoosts.count': { $gt: 0 },
          'activeBoosts.startDate': { $gte: twoHoursAgo },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $match: {
          'user.location': {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], maxDistance / 3963.2],
            },
          },
        },
      },
      {
        $addFields: {
          boostCount: { $arrayElemAt: ['$activeBoosts.count', 0] },
        },
      },
      {
        $sort: { boostCount: -1 },
      },
      {
        $project: {
          _id: 1,
          companyName: 1,
          businessType: 1,
          createdAt: 1,
          updatedAt: 1,
          'user._id': 1,
          'user.username': 1,
          'user.email': 1,
          'user.profileImage': 1,
          'user.attributes': 1,
          'user.displayName': 1,
          'user.location': 1,
          'user.businessType': 1,
          'user.isOnline': 1,
          'user.isVerified': 1,
          boostCount: 1,
        },
      },
    ]);

    return [...boostedIndividuals, ...boostedBusinesses].sort((a, b) => b.boostCount - a.boostCount);
  }

  private async getBoostedBusinessesByType(businessTypes: string[]): Promise<any[]> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    return this.businessService['businessRepository'].aggregate([
      {
        $lookup: {
          from: 'activeboosts',
          localField: 'user',
          foreignField: 'user',
          as: 'activeBoosts',
        },
      },
      {
        $match: {
          'activeBoosts.type': BoostType.SEARCH,
          'activeBoosts.count': { $gt: 0 },
          'activeBoosts.startDate': { $gte: twoHoursAgo },
          businessType: { $in: businessTypes },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $addFields: {
          boostCount: { $arrayElemAt: ['$activeBoosts.count', 0] },
        },
      },
      {
        $sort: { boostCount: -1 },
      },
      {
        $project: {
          _id: 1,
          companyName: 1,
          businessType: 1,
          createdAt: 1,
          updatedAt: 1,
          'user._id': 1,
          'user.username': 1,
          'user.email': 1,
          'user.profileImage': 1,
          'user.attributes': 1,
          'user.displayName': 1,
          'user.location': 1,
          'user.businessType': 1,
          'user.isOnline': 1,
          'user.isVerified': 1,
          boostCount: 1,
        },
      },
    ]);
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
