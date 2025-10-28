import { Module } from '@nestjs/common';
import { IndividualService } from './individual.service';
import { IndividualController } from './individual.controller';
import { IndividualRepositoryInterface } from './repositories/abstract/individual.repository-interface';
import { IndividualRepository } from './repositories/mongoose/individual.repository.mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Individual, IndividualSchema } from './models/individual.model';
import { UserModule } from 'src/user/user.module';
import { UserSettingModule } from 'src/user-setting/user-setting.module';
import { AttachmentModule } from 'src/attachment/attachment.module';

@Module({
  providers: [IndividualService, {
    provide: IndividualRepositoryInterface,
    useClass: IndividualRepository,
  }],
  imports: [
    MongooseModule.forFeature([{ name: Individual.name, schema: IndividualSchema }]),
    UserModule,
    UserSettingModule,
    AttachmentModule,
  ],
  controllers: [IndividualController],
  exports: [IndividualService],
})
export class IndividualModule {}
