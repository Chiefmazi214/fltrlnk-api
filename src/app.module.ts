import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { VerificationModule } from './verification/verification.module';
import { MailModule } from './mail/mail.module';
import { SmsModule } from './sms/sms.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from './storage/storage.module';
import { AttachmentModule } from './attachment/attachment.module';
import { GalleryModule } from './gallery/gallery.module';
import { ChatModule } from './chat/chat.module';
import { ConnectionModule } from './connection/connection.module';
import { IndividualModule } from './individual/individual.module';
import { BusinessModule } from './business/business.module';
import { PostModule } from './post/post.module';
import { UserSettingModule } from './user-setting/user-setting.module';
import { MapDiscoveryModule } from './map-discovery/map-discovery.module';
import { NotificationModule } from './notification/notification.module';
import { BoostModule } from './boost/boost.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<MailerOptions> => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          port: +configService.get('EMAIL_PORT'),
          secure: configService.get('EMAIL_SECURE') === 'true',
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
        template: {
          dir: process.cwd() + '/templates/',
          adapter: new EjsAdapter(),
        },
      }),
    }),
    CommonModule,
    UserModule,
    VerificationModule,
    MailModule,
    SmsModule,
    AuthModule,
    StorageModule,
    AttachmentModule,
    GalleryModule,
    ChatModule,
    ConnectionModule,
    IndividualModule,
    BusinessModule,
    PostModule,
    UserSettingModule,
    MapDiscoveryModule,
    NotificationModule,
    BoostModule,
    AnalyticsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
