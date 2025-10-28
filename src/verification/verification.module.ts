import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VerificationCodeRepositoryInterface } from './repositories/abstract/verification-code.repository-interface';
import { VerificationCodeRepository } from './repositories/mongoose/verification-code.repository.mongoose';
import { VerificationCode, VerificationCodeSchema } from './models/verification-code.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [VerificationService, {provide: VerificationCodeRepositoryInterface, useClass: VerificationCodeRepository}],
  controllers: [VerificationController],
  exports: [VerificationService],
  imports: [
    MongooseModule.forFeature([{ name: VerificationCode.name, schema: VerificationCodeSchema }]),
    UserModule,
  ],
})
export class VerificationModule {}
