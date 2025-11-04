import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { BoostService } from './boost.service';
import { BoostController } from './boost.controller';
import { RevenueCat, RevenueCatSchema } from './models/revenuecat.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RevenueCat.name, schema: RevenueCatSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BoostController],
  providers: [BoostService],
  exports: [BoostService],
})
export class BoostModule {}
