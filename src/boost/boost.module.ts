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
import { SubscriptionService } from './subscription.service';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSchema } from './models/transactions.model';

@Global()
@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: RevenueCat.name, schema: RevenueCatSchema },
      { name: Boost.name, schema: BoostSchema },
      { name: ActiveBoost.name, schema: ActiveBoostSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [BoostController],
  providers: [BoostService, SubscriptionRepository, SubscriptionService, TransactionService],
  exports: [BoostService, SubscriptionService, TransactionService],
})
export class BoostModule { }
