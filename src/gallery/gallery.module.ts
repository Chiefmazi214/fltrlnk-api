import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Gallery, GallerySchema } from './models/gallery.model';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { UserModule } from 'src/user/user.module';
import { StorageModule } from 'src/storage/storage.module';
import { GalleryRepositoryInterface } from './repositories/abstract/gallery.repository-interface';
import { GalleryRepository } from './repositories/mongoose/gallery.repository.mongoose';
import { GalleryController } from './gallery.controller';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gallery.name, schema: GallerySchema }]),
    AttachmentModule,
    UserModule,
    StorageModule,
  ],
  providers: [GalleryService,
    {
      provide: GalleryRepositoryInterface,
      useClass: GalleryRepository,
    },
  ],
  controllers: [GalleryController]
})
export class GalleryModule {}
