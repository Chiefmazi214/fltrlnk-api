import { Module, forwardRef } from '@nestjs/common';
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
import { WsAuthMiddleware } from 'src/auth/middleware/ws-auth.middleware';
import { ColabRepositoryInterface } from './repositories/abstract/colab.repository-interface';
import { ColabRepository } from './repositories/mongoose/colab.repository.mongoose';
import { Colab, ColabSchema } from './models/colab.model';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Colab.name, schema: ColabSchema },
    ]),
    AuthModule,
    UserModule,
    forwardRef(() => ConnectionModule),
  ],
  exports: [ChatService],
  providers: [
    ChatGateway,
    ChatService,
    WsAuthMiddleware,
    {
      provide: ChatRoomRepositoryInterface,
      useClass: ChatRoomRepository,
    },
    {
      provide: MessageRepositoryInterface,
      useClass: MessageRepository,
    },
    {
      provide: ColabRepositoryInterface,
      useClass: ColabRepository,
    },
  ],
  controllers: [ChatController],
})
export class ChatModule {}
