import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserRepository } from './repositories/mongoose/user.repository.mongoose';
import { RoleRepository } from './repositories/mongoose/role.repository.mongoose';
import { UserRepositoryInterface } from './repositories/abstract/user.repository-interface';
import { RoleRepositoryInterface } from './repositories/abstract/role.repository-interface';
import { User, UserSchema } from './models/user.model';
import { Role, RoleSchema } from './models/role.model';
import { UserController } from './user.controller';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { StorageModule } from 'src/storage/storage.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { LifestyleInfoRepositoryInterface } from './repositories/abstract/lifestyle-info.repository-interface';
import { LifestyleInfoRepository } from './repositories/mongoose/lifestyle-info.repository.mongoose';
import { LifestyleInfoService } from './lifestyle-info.service';
import { LifestyleInfo, LifestyleInfoSchema } from './models/lifestyle-info.model';
import { LifestyleInfoController } from './lifestyle-info.controller';
import { BusinessService } from 'src/business/business.service';
import { BusinessRepositoryInterface } from 'src/business/repositories/abstract/business.repository-interface';
import { BusinessRepository } from 'src/business/repositories/mongoose/business.repository.mongoose';
import { Business, BusinessSchema } from 'src/business/models/business.model';
import { Boost, BoostSchema } from 'src/boost/models/boost.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: LifestyleInfo.name, schema: LifestyleInfoSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Boost.name, schema: BoostSchema },
    ]),
    StorageModule,
    AttachmentModule
  ],
  providers: [
    UserService,
    RoleService,
    LifestyleInfoService,
    BusinessService,
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository
    },
    {
      provide: RoleRepositoryInterface,
      useClass: RoleRepository
    },
    {
      provide: LifestyleInfoRepositoryInterface,
      useClass: LifestyleInfoRepository
    },
    {
      provide: BusinessRepositoryInterface,
      useClass: BusinessRepository
    }
  ],
  exports: [UserService, RoleService, LifestyleInfoService],
  controllers: [UserController, LifestyleInfoController, RoleController],
})
export class UserModule {}
