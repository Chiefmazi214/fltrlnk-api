import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoostService } from './boost.service';
import { BoostController } from './boost.controller';
import { RevenueCat, RevenueCatSchema } from './models/revenuecat.model';
import { Boost, BoostSchema } from './models/boost.model';
import { ActiveBoost, ActiveBoostSchema } from './models/active-boost.model';
import { Subscription, SubscriptionSchema } from './models/subscription.model';
import { UserModule } from 'src/user/user.module';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { SubscriptionService } from './services/subscription.service';

@Global()
@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: RevenueCat.name, schema: RevenueCatSchema },
      { name: Boost.name, schema: BoostSchema },
      { name: ActiveBoost.name, schema: ActiveBoostSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [BoostController],
  providers: [BoostService, SubscriptionRepository, SubscriptionService],
  exports: [BoostService, SubscriptionService],
})
export class BoostModule {}
