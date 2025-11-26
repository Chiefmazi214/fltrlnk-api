import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRepositoryInterface } from './repositories/abstract/user.repository-interface';
import { User, UserDocument } from './models/user.model';
import { RoleService } from './role.service';
import { RoleEnum } from './models/role.model';
import {
  ChangeUserStatusInput,
  GetUsersWithPaginationQueryInput,
  UpdateUserDto,
} from './dtos/user.dto';
import { StorageService } from 'src/storage/storage.service';
import { AttachmentService } from 'src/attachment/attachment.service';
import { AttachmentType } from 'src/attachment/models/attachment.model';
import { LifestyleInfoService } from './lifestyle-info.service';
import {
  LifestyleCategory,
  LifestyleInfoDocument,
} from './models/lifestyle-info.model';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { BusinessService } from 'src/business/business.service';
import { Boost, BoostDocument } from 'src/boost/models/boost.model';
import { ProfileType } from './user.enum';
import { Business } from 'src/business/models/business.model';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepositoryInterface)
    private readonly userRepository: UserRepositoryInterface,
    private readonly roleService: RoleService,
    private readonly storageService: StorageService,
    private readonly attachmentService: AttachmentService,
    private readonly lifestyleInfoService: LifestyleInfoService,
    private readonly businessService: BusinessService,
  ) {}

  async getUserByEmail(email: string): Promise<UserDocument> {
    return this.userRepository.findOne({ email });
  }

  async getUserByPhone(phone: string): Promise<UserDocument> {
    return this.userRepository.findOne({ phone });
  }

  async getUserByPhoneOrEmail(
    phone?: string,
    email?: string,
  ): Promise<UserDocument> {
    const query: any = { $or: [] };

    if (phone) {
      query.$or.push({ phone });
    }

    if (email) {
      query.$or.push({ email });
    }

    if (query.$or.length === 0) {
      return null;
    }

    return this.userRepository.findOne(query);
  }

  async createUser(user: Partial<User>): Promise<UserDocument> {
    // Determine role based on profileType
    let roleEnum: RoleEnum;
    if (user.profileType === 'business') {
      roleEnum = RoleEnum.BUSINESS;
    } else if (user.profileType === 'individual') {
      roleEnum = RoleEnum.INDIVIDUAL;
    } else {
      roleEnum = RoleEnum.USER;
    }

    let role = await this.roleService.getOrCreateRole(roleEnum);
    user.roles = [role];
    console.log('@createUser..... ', JSON.stringify(user, undefined, 2));
    const newUser = await this.userRepository.create(user);
    return newUser;
  }

  async markAsVerifiedBusinessUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (user?.profileType === ProfileType.INDIVIDUAL) {
      return;
    }

    return this.userRepository.update(userId, { isVerified: true });
  }

  async markAsUnverifiedUser(userId: string) {
    return this.userRepository.update(userId, { isVerified: false });
  }

  async findById(userId: string) {
    return this.userRepository.findById(userId);
  }

  async updateUser(
    userId: string,
    user: Partial<UserDocument>,
  ): Promise<UserDocument> {
    console.log('@updateUser..... ', JSON.stringify(user, undefined, 2));
    return this.userRepository.update(userId, { ...user });
  }

  async validateEmailUniqueness(email: string, userId?: string) {
    const user = await this.getUserByEmail(email);
    if (user) {
      if (userId && user._id.toString() === userId) {
        return;
      }

      throw new ConflictException('Phone is already in use');
    }
  }

  async validatePhoneUniqueness(phone: string, userId?: string) {
    const user = await this.getUserByPhone(phone);

    if (user) {
      if (userId && user._id.toString() === userId) {
        return;
      }

      throw new ConflictException('Email is already in use');
    }
  }

  async updateUserProfile(
    userId: string,
    user: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatePayload: any = {
      displayName: user.displayName,
      username: user.username,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
      profileType: user.profileType,
      attributes: user.attributes,
      social: user.social,
      expoPushToken: user.expoPushToken,
      biography: user.biography,
    };

    if (user.email) {
      await this.validateEmailUniqueness(user.email, userId);
      updatePayload.email = user.email;
    }
    if (user.phone) {
      await this.validatePhoneUniqueness(user.phone, userId);
      updatePayload.phone = user.phone;
    }

    if (user.location) {
      updatePayload.location = {
        type: user.location.type,
        coordinates: user.location.coordinates,
      };
    }
    const updatedUser = await this.userRepository.update(userId, updatePayload);
    return updatedUser;
  }

  async updateUserProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UserDocument> {
    const user = await this.getUserById(userId);
    file.originalname = `${user.username}-${file.originalname}-${Date.now()}`;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profileImage) {
      await this.storageService.deleteFile(user.profileImage.path);
      const attachment = await this.attachmentService.getAttachmentByPath(
        user.profileImage.path,
      );
      if (attachment) {
        await this.attachmentService.deleteAttachment(
          attachment._id.toString(),
        );
      }
    }

    const filePath = await this.storageService.uploadFile(file);

    const newAttachment = await this.attachmentService.createAttachment({
      filename: file.originalname,
      path: filePath,
      type: AttachmentType.PROFILE_IMAGE,
      url: await this.storageService.getFilePublicUrl(filePath),
      user: user,
    });

    const updatedUser = await this.updateUser(userId, {
      profileImage: newAttachment,
    });
    return updatedUser;
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userRepository.findAll();
  }

  async getUsersWithPagination(
    query: GetUsersWithPaginationQueryInput,
  ): Promise<PaginatedResultDto<UserDocument>> {
    const queryBuilder: Record<string, any> = {};
    if (query.searchQuery) {
      queryBuilder.$or = [
        { username: { $regex: query.searchQuery, $options: 'i' } },
        { displayName: { $regex: query.searchQuery, $options: 'i' } },
        { email: { $regex: query.searchQuery, $options: 'i' } },
        { phone: { $regex: query.searchQuery, $options: 'i' } },
      ];
    }
    if (query.emailVerified) {
      queryBuilder.emailVerified = query.emailVerified === 'true';
    }
    if (query.phoneVerified) {
      queryBuilder.phoneVerified = query.phoneVerified === 'true';
    }
    if (query.profileType) {
      queryBuilder.profileType = query.profileType;
    }
    if (query.status) {
      queryBuilder.status = query.status;
    }
    if (query.state) {
      queryBuilder.businessState = { $regex: query.state, $options: 'i' };
    }
    if (query.category) {
      queryBuilder.businessCategory = { $regex: query.category, $options: 'i' };
    }

    const result = await this.userRepository.findWithPagination(
      queryBuilder,
      undefined,
      {
        page: query.page,
        limit: query.limit,
      },
    );

    return {
      data: result.data,
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getUserById(id: string): Promise<UserDocument> {
    let user = await this.userRepository.findById(id);
    if (user) {
      try {
        const business = await this.businessService.getBusiness(id);
        if (business) {
          // Convert to plain object and add businessId
          const userObject = user.toObject();
          (userObject as any).businessId = (business as any)._id.toString();
          return userObject as any;
        }
      } catch (error) {
        // Business not found for this user, which is fine
        console.log(`No business found for user ${id}`);
      }
    }
    return user;
  }

  async updateUserLifestyleInfo(
    userId: string,
    lifestyleInfoIds: string[],
  ): Promise<UserDocument> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lifestyleInfoObjectIds = lifestyleInfoIds.map(
      (id) => new Types.ObjectId(id),
    );

    return this.userRepository.update(
      userId,
      { lifestyleInfo: lifestyleInfoObjectIds as any },
      [{ path: 'lifestyleInfo', select: 'name icon category' }],
    );
  }

  async getUserLifestyleInfo(userId: string): Promise<LifestyleInfoDocument[]> {
    // ADDED BY GORKEM => Get lifestyle info for the user with the lifestyle info schema
    const user = await this.userRepository.findById(userId, [
      { path: 'lifestyleInfo', select: 'name icon category' },
    ]);
    return user.lifestyleInfo;
  }

  async getUsersByLifestyleInfo(
    lifestyleInfoId: string,
  ): Promise<UserDocument[]> {
    return this.userRepository.findAll({
      lifestyleInfo: new Types.ObjectId(lifestyleInfoId),
    });
  }

  async getUsersByLifestyleCategory(
    category: LifestyleCategory,
  ): Promise<UserDocument[]> {
    const lifestyleInfos =
      await this.lifestyleInfoService.getLifestyleInfoByCategory(category);
    const lifestyleInfoIds = lifestyleInfos.map((info) => info._id);

    return this.userRepository.findAll({
      lifestyleInfo: { $in: lifestyleInfoIds },
    });
  }

  async updateUserOnlineStatus(
    userId: string,
    isOnline: boolean,
  ): Promise<void> {
    await this.userRepository.update(userId, { isOnline });
  }

  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    let userObjectIdIds = userIds.map((id) => new Types.ObjectId(id));
    const onlineUsers = await this.userRepository.findAll({
      _id: { $in: userObjectIdIds },
      isOnline: true,
    });
    return onlineUsers.map((user) => user._id.toString());
  }

  async getMe(userId: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(userId, [
      { path: 'lifestyleInfo', select: 'name icon category' },
    ]);

    if (user) {
      try {
        const business = await this.businessService.getBusiness(userId);
        if (business) {
          // Convert to plain object and add businessId
          const userObject = user.toObject();
          (userObject as any).businessId = (business as any)._id.toString();
          return userObject as any;
        }
      } catch (error) {
        // Business not found for this user, which is fine
        console.log(`No business found for user ${userId}`);
      }
    }

    return user;
  }

  async findNearby(
    latitude: number,
    longitude: number,
    maxDistance: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResultDto<UserDocument>> {
    const { data, total } = await this.userRepository.findNearby(
      latitude,
      longitude,
      maxDistance,
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

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ username });
    return !!user;
  }

  async deleteUserById(id: string) {
    return this.userRepository.delete(id);
  }

  async updateUserStatusById(id: string, input: ChangeUserStatusInput) {
    return this.userRepository.update(id, { status: input.status });
  }
}
