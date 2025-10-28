import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { BusinessRepositoryInterface } from './repositories/abstract/business.repository-interface';
import { BusinessRepository } from './repositories/mongoose/business.repository.mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './models/business.model';
import { AttachmentModule } from 'src/attachment/attachment.module';

@Module({
  providers: [BusinessService,
    {
      provide: BusinessRepositoryInterface,
      useClass: BusinessRepository,
    },
  ],
  exports: [BusinessService],
  controllers: [BusinessController],
  imports: [
    MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]),
    AttachmentModule,
  ],
})
export class BusinessModule {}
