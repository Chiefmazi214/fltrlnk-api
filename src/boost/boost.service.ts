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
      { new: true, runValidators: true, upsert: true },
    );

    return revenueCat;
  }

  async getAllRevenueCatPlansWithFeatures() {
    try {
      const apiKey = this.configService.get<string>('REVENUECAT_API_KEY');

      if (!apiKey) {
        this.logger.warn(
          'REVENUECAT_API_KEY not found. Returning only database plans.',
        );
        return this.getPlansFromDatabaseOnly();
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.revenueCatApiUrl}/offerings`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const revenueCatOfferings = response.data.offerings || [];

      const dbPlans = await this.revenueCatModel.find();

      const mappedPlans = [];
      for (const offering of revenueCatOfferings) {
        if (offering.packages) {
          for (const pkg of offering.packages) {
            const revenuecatId = pkg.identifier;
            const features = dbPlans.find((plan) => plan.revenuecatId === revenuecatId)?.features || [];

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
    const revenueCatPlans = await this.revenueCatModel.find();

    return revenueCatPlans;
  }

}
