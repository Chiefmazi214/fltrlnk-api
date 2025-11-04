import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateBoostDto } from './dto/create-boost.dto';
import { UpdateBoostDto } from './dto/update-boost.dto';
import { CreateRevenueCatDto } from './dto/create-revenuecat.dto';
import { UpdateRevenueCatDto } from './dto/update-revenuecat.dto';
import { RevenueCat, RevenueCatDocument } from './models/revenuecat.model';

@Injectable()
export class BoostService {
  private readonly logger = new Logger(BoostService.name);
  private readonly revenueCatApiUrl = 'https://api.revenuecat.com/v1';

  constructor(
    @InjectModel(RevenueCat.name)
    private revenueCatModel: Model<RevenueCatDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  create(createBoostDto: CreateBoostDto) {
    return 'This action adds a new boost';
  }

  findAll() {
    return `This action returns all boost`;
  }

  findOne(id: number) {
    return `This action returns a #${id} boost`;
  }

  update(id: number, updateBoostDto: UpdateBoostDto) {
    return `This action updates a #${id} boost`;
  }

  remove(id: number) {
    return `This action removes a #${id} boost`;
  }

  // RevenueCat methods
  async createRevenueCat(createRevenueCatDto: CreateRevenueCatDto) {
    const revenueCat = new this.revenueCatModel(createRevenueCatDto);
    return revenueCat.save();
  }

  async updateRevenueCatFeatures(
    revenuecatId: string,
    updateRevenueCatDto: UpdateRevenueCatDto,
  ) {
    const revenueCat = await this.revenueCatModel.findOneAndUpdate(
      { revenuecatId },
      { features: updateRevenueCatDto.features },
      { new: true, runValidators: true },
    );

    if (!revenueCat) {
      throw new NotFoundException(
        `RevenueCat plan with ID "${revenuecatId}" not found`,
      );
    }

    return revenueCat;
  }

  async getAllRevenueCatPlansWithFeatures() {
    try {
      // Get RevenueCat API key from environment
      const apiKey = this.configService.get<string>('REVENUECAT_API_KEY');

      if (!apiKey) {
        this.logger.warn(
          'REVENUECAT_API_KEY not found. Returning only database plans.',
        );
        return this.getPlansFromDatabaseOnly();
      }

      // Fetch offerings (plans) from RevenueCat API
      const response = await firstValueFrom(
        this.httpService.get(`${this.revenueCatApiUrl}/offerings`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const revenueCatOfferings = response.data.offerings || [];

      // Fetch features from our database
      const dbPlans = await this.revenueCatModel.find().exec();

      // Create a map of revenuecatId to features for quick lookup
      const featuresMap = new Map(
        dbPlans.map((plan) => [plan.revenuecatId, plan.features]),
      );

      // Map RevenueCat offerings with features from database
      const mappedPlans = [];

      for (const offering of revenueCatOfferings) {
        if (offering.packages) {
          for (const pkg of offering.packages) {
            const revenuecatId = pkg.identifier;
            const features = featuresMap.get(revenuecatId) || [];

            mappedPlans.push({
              revenuecatId,
              identifier: pkg.identifier,
              packageType: pkg.package_type,
              product: {
                identifier: pkg.product?.identifier,
                displayName: pkg.product?.display_name,
                description: pkg.product?.description,
                priceString: pkg.product?.price_string,
                price: pkg.product?.price,
                currencyCode: pkg.product?.currency_code,
              },
              features,
              offering: {
                identifier: offering.identifier,
                description: offering.description,
              },
            });
          }
        }
      }

      return mappedPlans;
    } catch (error) {
      this.logger.error(
        `Failed to fetch RevenueCat plans: ${error.message}`,
        error.stack,
      );

      // Fallback to database-only plans if API call fails
      this.logger.warn('Falling back to database-only plans');
      return this.getPlansFromDatabaseOnly();
    }
  }

  private async getPlansFromDatabaseOnly() {
    const revenueCatPlans = await this.revenueCatModel.find().exec();

    return revenueCatPlans.map((plan) => ({
      revenuecatId: plan.revenuecatId,
      features: plan.features,
      _id: plan._id,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  async getRevenueCatPlanByRevenuecatId(revenuecatId: string) {
    const plan = await this.revenueCatModel.findOne({ revenuecatId }).exec();

    if (!plan) {
      throw new NotFoundException(
        `RevenueCat plan with ID "${revenuecatId}" not found`,
      );
    }

    return {
      revenuecatId: plan.revenuecatId,
      features: plan.features,
      _id: plan._id,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
