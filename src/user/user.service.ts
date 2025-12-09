import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  forwardRef,
} from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { UserRepositoryInterface } from './repositories/abstract/user.repository-interface';
import { User, UserDocument } from './models/user.model';
import { RoleService } from './role.service';
import { RoleEnum } from './models/role.model';
import {
  ChangeUserStatusInput,
  GetUsersWithPaginationQueryInput,
  UpdateReferralUsernameDto,
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
import { ProfileType, UserTier } from './user.enum';
import { Business } from 'src/business/models/business.model';
import { BoostService } from 'src/boost/boost.service';
import { SubscriptionService } from 'src/boost/subscription.service';
import { RevenueCatWebhookEvent } from 'src/boost/dto/webhook.dto';
import { ConfigService } from '@nestjs/config';
import { SubscriptionType } from 'src/boost/boost.enum';
import { TransactionService } from 'src/boost/transaction.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepositoryInterface)
    private readonly userRepository: UserRepositoryInterface,
    private readonly roleService: RoleService,
    private readonly storageService: StorageService,
    private readonly attachmentService: AttachmentService,
    private readonly lifestyleInfoService: LifestyleInfoService,
    private readonly boostService: BoostService,
    private readonly subscriptionService: SubscriptionService,
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => BusinessService))
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
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

  async updateByIds(userIds: string[], user: Partial<UserDocument>) {
    return this.userRepository.updateByIds(userIds, { ...user });
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

  async generateUsername() {
    const username = `fltr_${Math.floor(Math.random() * 20000)}`;
    const user = await this.userRepository.findByUsername(username);
    if (user) {
      return this.generateUsername();
    }

    return username;
  }

  async updateReferralUsername(
    userId: string,
    input: UpdateReferralUsernameDto,
  ): Promise<UserDocument> {
    if (!input.referralUsername) {
      await this.boostService.assignReferralBoost(userId);
      return;
    }

    const referralUser = await this.userRepository.findByUsername(
      input.referralUsername,
    );
    if (!referralUser) {
      await this.boostService.assignReferralBoost(userId);
      return;
    }

    const updatedUser = await this.userRepository.update(userId, {
      referralUsername: input.referralUsername,
    });
    await this.boostService.assignReferralBoost(
      userId,
      referralUser._id.toString(),
    );

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

  async getUsers(query: FilterQuery<UserDocument>): Promise<UserDocument[]> {
    return this.userRepository.findUsers(query);
  }

  async blockUser(userId: string, blockedUserId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.blockedUsers && user.blockedUsers.includes(blockedUserId)) {
      throw new ConflictException('User already blocked');
    }
    if (!user.blockedUsers) {
      user.blockedUsers = [blockedUserId];
    } else {
      user.blockedUsers.push(blockedUserId);
    }

    await user.save();
  }

  async unblockUser(userId: string, blockedUserId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.blockedUsers =
      user.blockedUsers?.filter(
        (id) => id?.toString() !== blockedUserId?.toString(),
      ) || [];
    await user.save();
  }

  async getBlockedUsers(userId: string) {
    const user = await this.userRepository.findByIdWithSelect(
      userId,
      'blockedUsers',
      [
        {
          path: 'blockedUsers',
          select: 'name displayName email profileImage username',
          populate: [{ path: 'profileImage', select: 'url' }],
        },
      ] as any,
    );
    return user?.blockedUsers;
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

    if (query.tier) {
      if (query.tier.toLowerCase() === UserTier.FREE) {
        queryBuilder.tier = { $in: [UserTier.FREE, null] };
      } else {
        queryBuilder.tier = query.tier;
      }
    }

    const result = await this.userRepository.findWithPagination(
      queryBuilder,
      undefined,
      {
        page: query.page,
        limit: query.limit,
      },
    );

    // Tier is now stored directly in the user model, no need to look up subscriptions
    return {
      data: result.data,
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  mapBusiness(user: User, business: Business) {
    if (!user.businessState) user.businessState = business.state;
    if (!user.businessCategory) user.businessCategory = business.category;
    if (!user.businessType) user.businessType = business.businessType;
    if (!user.businessNiche) user.businessNiche = business.niche;

    return user;
  }

  async getUserById(id: string): Promise<UserDocument> {
    let user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    let userObject = user.toObject();
    try {
      const boostsData = await this.boostService.getUserBoosts(
        user._id.toString(),
      );
      const boosts: any = boostsData?.[0]?.boosts || {};

      (userObject as any).boosts = {
        fltr: boosts?.fltr || 0,
        lnk: boosts?.lnk || 0,
        match: boosts?.match || 0,
        gps: boosts?.gps || 0,
        loc: boosts?.loc || 0,
        users: boosts?.users || 0,
        search: boosts?.search || 0,
      };
    } catch (error) {
      console.log(`No boosts found for user ${id}`);
    }

    try {
      const business = await this.businessService.getBusiness(id);
      if (business) {
        // Add businessId
        (userObject as any).businessId = (business as any)._id.toString();
        return this.mapBusiness(userObject, business) as any;
      }
    } catch (error) {
      // Business not found for this user, which is fine
      console.log(`No business found for user ${id}`);
    }

    return userObject as any;
  }

  // invites
  async getUserInvites(username: string) {
    let users = await this.userRepository.findAll({
      referralUsername: username,
    });

    return users;
  }

  // transactions
  async getUserTransactions(userId: string): Promise<any> {
    return this.transactionService.getUserTransactions(userId);
  }

  async getUserByIdForAdmin(id: string) {
    let user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    let userObject = user.toObject();
    try {
      const boostsData = await this.boostService.getUserBoosts(
        user._id.toString(),
      );
      const boosts: any = boostsData?.[0]?.boosts || {};

      (userObject as any).boosts = {
        fltr: boosts?.fltr || 0,
        lnk: boosts?.lnk || 0,
        match: boosts?.match || 0,
        gps: boosts?.gps || 0,
        loc: boosts?.loc || 0,
        users: boosts?.users || 0,
        search: boosts?.search || 0,
      };
    } catch (error) {
      console.log(`No boosts found for user ${id}`);
    }

    try {
      const business = await this.businessService.getBusiness(id);
      if (business) {
        (userObject as any).businessId = (business as any)._id.toString();
        userObject = this.mapBusiness(userObject, business) as any;
      }
    } catch (error) {
      // Business not found for this user, which is fine
      console.log(`No business found for user ${id}`);
    }

    try {
      let subscriptions = await this.subscriptionService.getUserSubscriptions(
        user._id.toString(),
      );
      (userObject as any).subscriptions = subscriptions;
    } catch (error) {
      console.log(`No subscriptions found for user ${id}`);
    }

    try {
      let invites = await this.getUserInvites(user.username);
      (userObject as any).invites = invites;
    } catch (error) {
      console.log(`No invites found for user ${id}`);
    }

    try {
      let transactions = await this.getUserTransactions(user._id.toString());
      (userObject as any).transactions = transactions;
    } catch (error) {
      console.log(`No transactions found for user ${id}`);
    }

    return userObject as any;
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

  async countUsers(query: any = {}): Promise<number> {
    return this.userRepository.count(query);
  }

  async getTopInvites(limit: number = 20) {
  return (this.userRepository as any).userModel.aggregate([
    { $match: { referralUsername: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$referralUsername',
        totalReferrals: { $sum: 1 },
        activeSubscribers: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$tier', UserTier.BASIC] },
                  { $eq: ['$tier', UserTier.PRO] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'username',
        as: 'referrerUser',
      },
    },
    {
      $unwind: {
        path: '$referrerUser',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        displayName: '$referrerUser.displayName',
        email: '$referrerUser.email',
        handle: '$referrerUser.handle',
        state: '$referrerUser.state',
        username: '$referrerUser.username',
        referrerTier: '$referrerUser.tier',
        joinedAt: '$referrerUser.createdAt',
        conversionRate: {
          $cond: {
            if: { $gt: ['$totalReferrals', 0] },
            then: {
              $multiply: [
                { $divide: ['$activeSubscribers', '$totalReferrals'] },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    },
    { $sort: { activeSubscribers: -1 } },
    { $limit: limit },
  ]);
}
  async getAllInvites() {
  return (this.userRepository as any).userModel.aggregate([
    { $match: { referralUsername: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$referralUsername',
        totalReferrals: { $sum: 1 },
        activeSubscribers: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$tier', UserTier.BASIC] },
                  { $eq: ['$tier', UserTier.PRO] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'username',
        as: 'referrerUser',
      },
    },
    {
      $addFields: {
        displayName: '$referrerUser.displayName',
        email: '$referrerUser.email',
        handle: '$referrerUser.handle',
        state: '$referrerUser.state',
        username: '$referrerUser.username',
        referrerTier: '$referrerUser.tier',
        joinedAt: '$referrerUser.createdAt',
      },
    },
    {
      $addFields: {
        conversionRate: {
          $cond: {
            if: { $gt: ['$totalReferrals', 0] },
            then: {
              $multiply: [
                { $divide: ['$activeSubscribers', '$totalReferrals'] },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    },
    { $sort: { activeSubscribers: -1 } },
  ]);
}

  async adminUpdateUser(userId: string, input: any): Promise<UserDocument> {
    const updateData: any = {};
    const currentUser = await this.userRepository.findById(userId);

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.tier !== undefined && input.tier !== currentUser.tier) {
      updateData.tier = input.tier;

      const productId =
        input.tier === SubscriptionType.BASIC
          ? this.configService.get('REVENUECAT_BASIC_PRODUCT_ID')
          : this.configService.get('REVENUECAT_PRO_PRODUCT_ID');

      if (input.tier === UserTier.BASIC || input.tier === UserTier.PRO) {
        const existingSubscription =
          await this.subscriptionService.getActiveSubscription(userId);
        if (existingSubscription) {
          await this.subscriptionService.handleExpiration({
            app_user_id: userId,
            expiration_at_ms: Date.now(),
            event_timestamp_ms: Date.now(),
          } as RevenueCatWebhookEvent);
        }

        const startDate = new Date();
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);

        await this.subscriptionService.handleInitialPurchase({
          product_id: productId,
          expiration_at_ms: renewalDate.getTime(),
          id: `admin_${userId}_${Date.now()}`,
          app_user_id: userId,
          purchased_at_ms: startDate.getTime(),
          will_renew: false,
          is_paid: false,
        } as any, true);

        if (currentUser.profileType === 'business') {
          await this.markAsVerifiedBusinessUser(userId);
        }
      } else if (input.tier === UserTier.FREE) {
        await this.subscriptionService.expireAllSubscriptions(userId);
      }
    }

    if (input.boosts !== undefined) {
      const boostUpdates = Object.entries(input.boosts).map(
        ([type, count]) => ({
          type,
          count: Number(count),
        }),
      );

      for (const { type, count } of boostUpdates) {
        await this.boostService.grantBoosts(userId, type as any, count);
      }
    }

    return this.userRepository.update(userId, updateData);
  }
}
