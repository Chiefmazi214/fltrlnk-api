import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatRoom, ChatRoomSchema } from './models/chat-room.model';
import { Message, MessageSchema } from './models/message.model';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoomRepositoryInterface } from './repositories/abstract/chat-room.repository-interface';
import { ChatRoomRepository } from './repositories/mongoose/chat-room.repository.mongoose';
import { MessageRepositoryInterface } from './repositories/abstract/message.repository-interface';
import { MessageRepository } from './repositories/mongoose/message.repository.mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsAuthMiddleware } from 'src/auth/middleware/ws-auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    AuthModule,
    UserModule
  ],
  exports: [ChatService],
  providers: [
    ChatGateway,
    ChatService,
    WsAuthMiddleware,
    {
      provide: ChatRoomRepositoryInterface,
      useClass: ChatRoomRepository
    },
    {
      provide: MessageRepositoryInterface,
      useClass: MessageRepository
    }
  ],
  controllers: [ChatController]
})
export class ChatModule {}
