import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepositoryInterface } from './repositories/abstract/business.repository-interface';
import { CreateBusinessDto } from './dtos/create-business.dto';
import { Business, BusinessDocument } from './models/business.model';
import { UpdateBusinessDto } from './dtos/update-business.dto';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { AttachmentService } from 'src/attachment/attachment.service';
import { GetBusinessesWithPaginationQueryInput } from './dtos/business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @Inject(BusinessRepositoryInterface)
    private businessRepository: BusinessRepositoryInterface,
    private attachmentService: AttachmentService,
  ) {}

  private convertWorkingHoursToMap(workingHours: any): Map<string, any> {
    if (!workingHours) return new Map();
    return new Map(Object.entries(workingHours));
  }

  private removeUndefined(obj: any) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined),
    );
  }

  async createBusiness(
    userId: string,
    business: CreateBusinessDto,
  ): Promise<Business> {
    const newBusiness = await this.businessRepository.create({
      ...business,
      workingHours: this.convertWorkingHoursToMap(business.workingHours),
      user: new mongoose.Types.ObjectId(userId),
      mapDiscovery: business.mapDiscovery,
    });
    return newBusiness;
  }

  async updateBusiness(
    userId: string,
    business: UpdateBusinessDto,
  ): Promise<BusinessDocument> {
    const existingBusiness = await this.businessRepository.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!existingBusiness) {
      throw new NotFoundException('Business not found for this user');
    }

    const updatePayload = this.removeUndefined({
      ...business,
      workingHours:
        business.workingHours !== undefined
          ? this.convertWorkingHoursToMap(business.workingHours)
          : undefined,
      mapDiscovery: business.mapDiscovery,
    });

    const updatedBusiness = await this.businessRepository.update(
      existingBusiness._id.toString(),
      updatePayload,
      [
        {
          path: 'user',
          select:
            'username email profileImage attributes displayName location lifestyleInfo isOnline profileType businessType ',
        },
      ],
    );

    if (!updatedBusiness) {
      throw new NotFoundException('Failed to update business');
    }

    return updatedBusiness.populate(
      'user',
      'username email profileImage profileType',
    );
  }

  async getBusiness(userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne(
      { user: new mongoose.Types.ObjectId(userId) },
      [
        {
          path: 'user',
          select:
            'username email profileImage attributes displayName location lifestyleInfo isOnline profileType businessType',
        },
      ],
    );
    return business;
  }

  async getBusinessById(id: string): Promise<Business> {
    if (!id || id === 'undefined' || id === 'null') {
      throw new NotFoundException('Invalid business ID provided');
    }

    const business = await this.businessRepository.findById(id, [
      {
        path: 'user',
        select:
          'username email profileImage attributes displayName location lifestyleInfo isOnline profileType businessType businessAddress',
      },
    ]);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Fetch attachments for the business user
    const attachments = await this.attachmentService.getAttachmentsByUser(
      business.user._id.toString(),
    );

    // Add attachments to the business object
    return {
      ...business.toObject(),
      attachments,
    } as any;
  }

  async getBusinesses(
    paginationDto: PaginationDto,
    searchQuery?: string,
  ): Promise<PaginatedResultDto<Business>> {
    const { page = 1, limit = 10 } = paginationDto;

    // Use the new getAll method if searchQuery is provided
    if (searchQuery) {
      const { data, total } = await this.businessRepository.getAll(page, limit, searchQuery);

      // Fetch attachments for each business
      const businessesWithAttachments = await Promise.all(
        data.map(async (business: any) => {
          if (business.user && business.user._id) {
            const attachments = await this.attachmentService.getAttachmentsByUser(
              business.user._id.toString(),
            );
            return {
              ...business,
              attachments,
            };
          }
          return business;
        }),
      );

      return {
        data: businessesWithAttachments as any,
        total,
        page,
        limit,
      };
    }

    const skip = (page - 1) * limit;
    const [businesses, total] = await Promise.all([
      this.businessRepository.findAll(
        {},
        [
          {
            path: 'user',
            select:
              'username email profileImage attributes displayName location lifestyleInfo isOnline profileType businessType',
          },
        ],
        { skip, limit },
      ),
      this.businessRepository.count(),
    ]);

    // Fetch attachments for each business
    const businessesWithAttachments = await Promise.all(
      businesses.map(async (business) => {
        if (business.user && business.user._id) {
          const attachments = await this.attachmentService.getAttachmentsByUser(
            business.user._id.toString(),
          );
          return {
            ...business.toObject(),
            attachments,
          };
        }
        return business.toObject();
      }),
    );

    return {
      data: businessesWithAttachments as any,
      total,
      page,
      limit,
    };
  }

  async findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number,
    businessType: string,
    page: number,
    limit: number,
    searchQuery?: string,
  ): Promise<PaginatedResultDto<BusinessDocument>> {
    console.log({
      latitude,
      longitude,
      maxDistance,
      businessType,
      page,
      limit,
      searchQuery,
    });
    const { data, total } = await this.businessRepository.findNearby(
      latitude,
      longitude,
      maxDistance,
      businessType,
      page,
      limit,
      searchQuery,
    );
    console.log('@1...data.', data.length);
    console.log('@2...total.', total);
    console.log('@3...type', businessType);
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findNearbyByName(
    latitude: number,
    longitude: number,
    maxDistance: number,
    name: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResultDto<BusinessDocument>> {
    const { data, total } = await this.businessRepository.findNearbyByName(
      latitude,
      longitude,
      maxDistance,
      name,
      page,
      limit,
    );
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByName(
    name: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResultDto<BusinessDocument>> {
    const { data, total } = await this.businessRepository.findByName(
      name,
      page,
      limit,
    );
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getBusinessesWithPagination(
    query: GetBusinessesWithPaginationQueryInput,
  ): Promise<PaginatedResultDto<BusinessDocument>> {
    const queryBuilder: Record<string, any> = {};

    if (query.searchQuery) {
      queryBuilder.$or = [
        { companyName: { $regex: query.searchQuery, $options: 'i' } },
        { category: { $regex: query.searchQuery, $options: 'i' } },
        { niche: { $regex: query.searchQuery, $options: 'i' } },
      ];
    }

    if (query.category) {
      queryBuilder.category = { $regex: query.category, $options: 'i' };
    }

    if (query.state) {
      queryBuilder.state = { $regex: query.state, $options: 'i' };
    }

    const skip = (query.page - 1) * query.limit;
    const [businesses, total] = await Promise.all([
      this.businessRepository.findAll(
        queryBuilder,
        [
          {
            path: 'user',
            select:
              'username email profileImage attributes displayName location lifestyleInfo isOnline profileType businessType status',
          },
        ],
        { skip, limit: query.limit },
      ),
      this.businessRepository.count(queryBuilder),
    ]);

    return {
      data: businesses,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
