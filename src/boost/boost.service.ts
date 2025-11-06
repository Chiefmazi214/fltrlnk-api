import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateRevenueCatInput } from './dto/revenuecat.dto';
import { RevenueCat, RevenueCatDocument } from './models/revenuecat.model';

@Injectable()
export class BoostService {
  constructor(
    @InjectModel(RevenueCat.name)
    private readonly revenueCatModel: Model<RevenueCatDocument>,
  ) {}

  async deleteRevenueCat(revenuecatId: string) {
    return this.revenueCatModel.findOneAndDelete({ revenuecatId });
  }

  async getRevenueCatById(revenuecatId: string) {
    return this.revenueCatModel.findOne({ revenuecatId });
  }

  async updateRevenueCatFeatures(
    revenuecatId: string,
    updateRevenueCatDto: UpdateRevenueCatInput,
  ) {
    const revenueCat = await this.revenueCatModel.findOneAndUpdate(
      { revenuecatId },
      { features: updateRevenueCatDto.features },
      { new: true, runValidators: true, upsert: true },
    );

    return revenueCat;
  }

  async getAllPlans() {
    return this.revenueCatModel.find();
  }
}
