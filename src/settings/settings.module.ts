import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Settings, SettingsSchema } from './models/settings.model';
import { SettingsRepository } from './repositories/mongoose/settings.repository.mongoose';
import { SettingsRepositoryInterface } from './repositories/abstract/settings.repository-interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }]),
  ],
  providers: [
    SettingsService,
    {
      provide: SettingsRepositoryInterface,
      useClass: SettingsRepository
    }
  ],
  controllers: [SettingsController],
  exports: [SettingsService]
})
export class SettingsModule {}
