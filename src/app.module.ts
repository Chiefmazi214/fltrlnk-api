import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
