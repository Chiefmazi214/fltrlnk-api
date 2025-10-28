import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './models/post.model';
import { PostRepositoryInterface } from './repositories/abstract/post.repository-interface';
import { PostRepository } from './repositories/mongoose/post.repository.mongoose';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { StorageModule } from 'src/storage/storage.module';
import { UserModule } from 'src/user/user.module';
import { CommentRepositoryInterface } from './repositories/abstract/comment.repository-interface';
import { CommentRepository } from './repositories/mongoose/comment.repository.mongoose';
import { Comment, CommentSchema } from './models/comment.model';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    AttachmentModule,
    StorageModule,
    UserModule,
    NotificationModule
  ],
  providers: [
    PostService,
    CommentService,
    {
      provide: PostRepositoryInterface,
      useClass: PostRepository
    },
    {
      provide: CommentRepositoryInterface,
      useClass: CommentRepository
    }
  ],
  controllers: [PostController, CommentController]
})
export class PostModule {}
