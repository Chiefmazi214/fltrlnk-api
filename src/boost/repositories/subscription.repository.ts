import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus } from '../models/subscription.model';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto/subscription.dto';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument> {
    const subscription = new this.subscriptionModel({
      ...createSubscriptionDto,
      user: new Types.ObjectId(createSubscriptionDto.user),
    });
    return subscription.save();
  }

  async findById(id: string): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel
      .findOne({
        user: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    userId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel
      .findOneAndUpdate(
        { user: new Types.ObjectId(userId) },
        { $set: updateSubscriptionDto },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async delete(id: string): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel.findByIdAndDelete(id).exec();
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const count = await this.subscriptionModel
      .countDocuments({
        user: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();
    return count > 0;
  }
}
