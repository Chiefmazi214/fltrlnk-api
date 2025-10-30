import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './models/notification.model';
import { NotificationRepository } from './repositories/mongoose/notification.repository.mongoose';
import { NotificationRepositoryInterface } from './repositories/abstract/notification.repository-interface';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  providers: [
    NotificationService,
    {
      provide: NotificationRepositoryInterface,
      useClass: NotificationRepository,
    },
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    UserModule,
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
