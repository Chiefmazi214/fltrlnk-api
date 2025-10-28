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
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Connection.name, schema: ConnectionSchema },
      { name: Follow.name, schema: FollowSchema }
    ]),
    UserModule,
    ChatModule,
    NotificationModule
  ],
  exports: [ConnectionService, FollowService],
  providers: [
    ConnectionService, 
    FollowService, 
    {
      provide: ConnectionRepositoryInterface,
      useClass: ConnectionRepository,
    },
    {
      provide: FollowRepositoryInterface,
      useClass: FollowRepository,
    }
  ],
  controllers: [ConnectionController]
})
export class ConnectionModule {}
