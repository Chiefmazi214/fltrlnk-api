import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IndividualRepositoryInterface } from './repositories/abstract/individual.repository-interface';
import { Individual } from './models/individual.model';
import { UserService } from 'src/user/user.service';
import { CreateIndividualDto } from './dtos/create-individual.dto';
import { UpdateIndividualDto } from './dtos/update-individual.dto';
import { RoleService } from 'src/user/role.service';
import { RoleEnum } from 'src/user/models/role.model';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { UserSettingService } from 'src/user-setting/user-setting.service';
import { UserSettingRepositoryInterface } from 'src/user-setting/repositories/abstract/user-setting.repository-interface';
import { AttachmentService } from 'src/attachment/attachment.service';

@Injectable()
export class IndividualService {
  constructor(
    @Inject(IndividualRepositoryInterface)
    private individualRepository: IndividualRepositoryInterface,
    private userService: UserService,
    private roleService: RoleService,
    private userSettingService: UserSettingService,
    private attachmentService: AttachmentService,
  ) {}

  async createIndividual(
    userId: string,
    individual: CreateIndividualDto,
  ): Promise<Individual> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newIndividual = await this.individualRepository.create(
      {
        ...individual,
        user: user._id,
        mapDiscovery: individual.mapDiscovery,
        fltrlScreen: individual.fltrlScreen,
      },
      [
        {
          path: 'user',
          select:
            'username email profileImage attributes displayName location lifestyleInfo isOnline',
        },
      ],
    );
    const role = await this.roleService.getOrCreateRole(RoleEnum.INDIVIDUAL);
    await this.userService.updateUser(userId, {
      roles: [...user.roles, role],
    });
    return newIndividual;
  }

  async updateIndividual(
    userId: string,
    individual: UpdateIndividualDto,
  ): Promise<Individual> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existingIndividual = await this.individualRepository.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });
    if (!existingIndividual) {
      throw new NotFoundException('Individual not found for this user');
    }
    const updatedIndividual = await this.individualRepository.update(
      existingIndividual._id.toString(),
      {
        ...individual,
        mapDiscovery: individual.mapDiscovery,
        fltrlScreen: individual.fltrlScreen,
      },
      [
        {
          path: 'user',
          select:
            'username email profileImage attributes displayName location lifestyleInfo isOnline',
        },
      ],
    );
    return updatedIndividual;
  }

  async getIndividual(userId: string): Promise<Individual> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const individual = await this.individualRepository.findOne(
      { user: new mongoose.Types.ObjectId(userId) },
      [
        {
          path: 'user',
          select:
            'username email profileImage attributes displayName location lifestyleInfo isOnline',
        },
      ],
    );
    return individual;
  }

  async getIndividuals(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResultDto<Individual>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [individuals, total] = await Promise.all([
      this.individualRepository.findAll(
        {},
        [
          {
            path: 'user',
            select:
              'username email profileImage attributes displayName location lifestyleInfo isOnline businessType',
          },
        ],
        { skip, limit },
      ),
      this.individualRepository.count(),
    ]);

    // Fetch attachments for each individual
    const individualsWithAttachments = await Promise.all(
      individuals.map(async (individual) => {
        if (individual.user && individual.user._id) {
          const attachments = await this.attachmentService.getAttachmentsByUser(individual.user._id.toString());
          return {
            ...individual.toObject(),
            attachments,
          };
        }
        return individual.toObject();
      })
    );

    return {
      data: individualsWithAttachments as any,
      total,
      page,
      limit,
    };
  }

  async getIndividualById(id: string): Promise<Individual> {
    if (!id || id === 'undefined' || id === 'null') {
      throw new NotFoundException('Invalid individual ID provided');
    }
    
    const individual = await this.individualRepository.findById(id, [
      {
        path: 'user',
        select:
          'username email profileImage attributes displayName location lifestyleInfo isOnline businessType',
      },
    ]);
    if (!individual) {
      throw new NotFoundException('Individual not found');
    }
    return individual;
  }

  async getIndividualsByLifestyleInfo(
    paginationDto: PaginationDto,
    userId: string,
    lifestyleInfoIds?: string[],
  ): Promise<PaginatedResultDto<Individual>> {
    const { page = 1, limit = 100 } = paginationDto;
    const skip = (page - 1) * limit;

    let idsToUse: string[] = [];
    console.log("@1......idsToUse....",idsToUse);
    if (!lifestyleInfoIds || lifestyleInfoIds.length === 0) {
      const userSetting =
        await this.userSettingService.getUserSettingByUserId(userId);
      console.log("@2......userSetting....",userSetting);
      if (
        userSetting &&
        userSetting.lifestyleInfos &&
        userSetting.lifestyleInfos.length > 0
      ) {
        idsToUse = userSetting.lifestyleInfos.map((id) => id.toString());
      }
    } else {
      idsToUse = lifestyleInfoIds;
    }

    if (!idsToUse || idsToUse.length === 0) {
      const [individuals, total] = await Promise.all([
        this.individualRepository.findAll(
          {},
          [
            {
              path: 'user',
              select:
                'username email profileImage attributes displayName location lifestyleInfo isOnline businessType ',
            },
          ],
          { skip, limit },
        ),
        this.individualRepository.count(),
      ]);
      return {
        data: individuals,
        total,
        page,
        limit,
      };
    }

    const pipeline = [
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
          'user.lifestyleInfo': {
            $elemMatch: {
              _id: {
                $in: idsToUse.map((id) => new mongoose.Types.ObjectId(id)),
              },
            },
          },
        },
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
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const [result] = await this.individualRepository.aggregate(pipeline);
    const total = result.metadata[0]?.total || 0;

    return {
      data: result.data,
      total,
      page,
      limit,
    };
  }

  async findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number,
    page: number,
    limit: number,
    requesterUserId?: string,
  ): Promise<PaginatedResultDto<Individual>> {
    const { data, total } = await this.individualRepository.findNearby(
      latitude,
      longitude,
      maxDistance,
      page,
      limit,
    );
    const filteredData = requesterUserId
      ? data.filter(
          (item: any) =>
            item.user && item.user._id.toString() !== requesterUserId,
        )
      : data;
    const filteredTotal = requesterUserId ? filteredData.length : total;
    return {
      data: filteredData,
      total: filteredTotal,
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
  ): Promise<PaginatedResultDto<Individual>> {
    const { data, total } = await this.individualRepository.findNearbyByName(
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
  ): Promise<PaginatedResultDto<Individual>> {
    const { data, total } = await this.individualRepository.findByName(
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
}
