import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { ConnectionRepository } from './repositories/mongoose/connection.repository.mongoose';
import { ConnectionRepositoryInterface } from './repositories/abstract/connection.repository-interface';
import { FollowRepositoryInterface } from './repositories/abstract/follow.repository-interface';
import { FollowRepository } from './repositories/mongoose/follow.repository.mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionSchema } from './models/connection.model';
import { Follow, FollowSchema } from './models/follow.model';
import { UserModule } from 'src/user/user.module';
import { FollowService } from './follow.service';
import { ChatModule } from 'src/chat/chat.module';
import { LikeRepository } from './repositories/mongoose/like.repository.mongoose';
import { LikeRepositoryInterface } from './repositories/abstract/like.repository-interface';
import { LikeService } from './like.service';
import { Like, LikeSchema } from './models/like.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Connection.name, schema: ConnectionSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    UserModule,
    ChatModule,
  ],
  exports: [ConnectionService, FollowService, LikeService],
  providers: [
    ConnectionService,
    FollowService,
    LikeService,
    {
      provide: ConnectionRepositoryInterface,
      useClass: ConnectionRepository,
    },
    {
      provide: LikeRepositoryInterface,
      useClass: LikeRepository,
    },
    {
      provide: FollowRepositoryInterface,
      useClass: FollowRepository,
    },
  ],
  controllers: [ConnectionController],
})
export class ConnectionModule {}
