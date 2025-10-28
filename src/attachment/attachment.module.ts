import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, AttachmentSchema } from './models/attachment.model';
import { AttachmentRepositoryInterface } from './repositories/abstract/attachment.repository-interface';
import { AttachmentRepository } from './repositories/mongoose/attachment.repository.mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema }
    ])
  ],
  providers: [
    AttachmentService,
    {
      provide: AttachmentRepositoryInterface,
      useClass: AttachmentRepository
    }
  ],
  exports: [AttachmentService]
})
export class AttachmentModule {}
