import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './models/notification.model';
import { NotificationRepository } from './repositories/mongoose/notification.repository.mongoose';
import { NotificationRepositoryInterface } from './repositories/abstract/notification.repository-interface';
import { UserModule } from 'src/user/user.module';
import { MailService } from './mail.service';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [
    NotificationService,
    MailService,
    SmsService,
    {
      provide: NotificationRepositoryInterface,
      useClass: NotificationRepository,
    },
  ],
  imports: [
    TwilioModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.get('TWILIO_ACCOUNT_SID'),
        authToken: configService.get('TWILIO_AUTH_TOKEN'),
      }),
    }),

    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    UserModule,
  ],
  controllers: [NotificationController],
  exports: [NotificationService, MailService, SmsService],
})
export class NotificationModule {}
