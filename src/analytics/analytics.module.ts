import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UserModule } from 'src/user/user.module';
import { BusinessModule } from 'src/business/business.module';
import { BoostModule } from 'src/boost/boost.module';
import { User, UserSchema } from 'src/user/models/user.model';
import { Subscription, SubscriptionSchema } from 'src/boost/models/subscription.model';
import { Transaction, TransactionSchema } from 'src/boost/models/transactions.model';
import { Sweepstakes, SweepstakesSchema } from './models/sweepstake.model';
import { SweepstakesService } from './sweepstakes.service';
import { Follow, FollowSchema } from 'src/connection/models/follow.model';

@Module({
  imports: [
    UserModule,
    BusinessModule,
    BoostModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Sweepstakes.name, schema: SweepstakesSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, SweepstakesService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }
