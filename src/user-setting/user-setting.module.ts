import { Module } from '@nestjs/common';
import { UserSettingService } from './user-setting.service';
import { UserSettingController } from './user-setting.controller';
import { UserSetting, UserSettingSchema } from './models/user-setting.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSettingRepository } from './repositories/mongoose/user-setting.repository.mongoose';
import { UserSettingRepositoryInterface } from './repositories/abstract/user-setting.repository-interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSetting.name, schema: UserSettingSchema }]),
  ],
  providers: [
    UserSettingService,
    {
      provide: UserSettingRepositoryInterface,
      useClass: UserSettingRepository
    }
  ],
  controllers: [UserSettingController],
  exports: [UserSettingService]
})
export class UserSettingModule {}
