import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { UseGuards, Inject } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WsAuthGuard } from 'src/auth/guards/ws-auth.guard';
import { WsAuthMiddleware } from 'src/auth/middleware/ws-auth.middleware';
import { ISendMessagePayload } from './chat.types';

@WebSocketGateway({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'],
    },
    namespace: '/chat',
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    path: '/socket.io/',
    serveClient: false,
    adapter: null,
    allowUpgrades: true,
    maxHttpBufferSize: 1e8
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() 
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly wsAuthMiddleware: WsAuthMiddleware
    ) {}

    afterInit(server: Server) {
        console.log('ChatGateway initialized');

        // Set this gateway instance in the chat service
        this.chatService.setGateway(this);

        // Apply middleware to all incoming connections
        server.use(async (socket: Socket, next) => {
            try {
                await this.wsAuthMiddleware.use(socket, next);
            } catch (error) {
                next(error);
            }
        });

        server.on('connection', (socket) => {
            console.log('Socket ID:', socket.id);

            socket.onAny((eventName, ...args) => {
                console.log('Received event:', eventName);
                console.log('Event arguments:', args);
            });
        });
    }

    async handleConnection(client: Socket) {
        try {
            const userId = client.data.userId;
            if (!userId) {
                console.log('Connection rejected: No userId in socket data');
                client.disconnect();
                return;
            }

            await this.chatService.updateUserOnlineStatus(userId, true);
            console.log(`Client connected: ${userId}`);

            const userRooms = await this.chatService.getUserChatRooms(userId);
            
            for (const room of userRooms) {
                client.join(room._id.toString());
                console.log(`User ${userId} joined room ${room._id}`);

                const onlineUsers = await this.chatService.getOnlineUsers(room._id.toString());
                this.server.to(room._id.toString()).emit('userOnlineStatus', {
                    userId,
                    isOnline: true,
                    onlineUsers
                });
            }
        } catch (error) {
            console.error('Error in handleConnection:', error);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        try {
            const userId = client.data.userId;
            if (userId) {
                await this.chatService.updateUserOnlineStatus(userId, false);
                console.log(`Client disconnected: ${userId}`);

                const userRooms = await this.chatService.getUserChatRooms(userId);
                
                for (const room of userRooms) {
                    const onlineUsers = await this.chatService.getOnlineUsers(room._id.toString());
                    this.server.to(room._id.toString()).emit('userOnlineStatus', {
                        userId,
                        isOnline: false,
                        onlineUsers
                    });
                }
            }
        } catch (error) {
            console.error('Error in handleDisconnect:', error);
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('joinChatRoom')
    async handleJoinChatRoom(client: Socket, payload: { chatRoomId: string }) {
        try {
            const userId = client.data.userId;
            
            // Extract chatRoomId from payload object
            const chatRoomId = payload?.chatRoomId;
            
            if (!chatRoomId) {
                throw new WsException('Missing chatRoomId');
            }

            const canJoin = await this.chatService.canUserJoinRoom(userId, chatRoomId);
            if (!canJoin) {
                throw new WsException('You are not allowed to join this chat room');
            }

            client.join(chatRoomId);
            const messages = await this.chatService.getChatRoomMessages(chatRoomId);
            client.emit('chatRoomMessages', messages);

            const onlineUsers = await this.chatService.getOnlineUsers(chatRoomId);
            this.server.to(chatRoomId).emit('userOnlineStatus', {
                userId,
                isOnline: true,
                onlineUsers
            });
        } catch (error) {
            console.error('Error in handleJoinChatRoom:', error);
            if (error instanceof WsException) {
                client.emit('error', { message: error.message });
            } else {
                client.emit('error', { message: 'Failed to join chat room' });
            }
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: ISendMessagePayload) {
        try {
            const userId = client.data.userId;
            
            if (!userId) {
                throw new WsException('User not authenticated');
            }

            const payloadObject = payload;

            if (!payloadObject.chatRoomId || !payloadObject.content) {
                throw new WsException('Missing required fields');
            }

            const canJoin = await this.chatService.canUserJoinRoom(userId, payloadObject.chatRoomId);
            if (!canJoin) {
                throw new WsException('You are not allowed to send messages in this chat room');
            }

            const message = await this.chatService.createMessage(userId, {
                chatRoomId: payloadObject.chatRoomId,
                content: payloadObject.content,
            });

            this.server.to(payloadObject.chatRoomId).emit('newMessage', message);
    
            client.emit('messageSent', {
                id: message._id,
                content: message.content,
                sender: message.sender,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in handleMessage:', error);
            if (error instanceof WsException) {
                client.emit('error', { message: error.message });
            } else {
                client.emit('error', { message: 'Failed to send message. Please try again.' });
            }
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('leaveChatRoom')
    async handleLeaveChatRoom(client: Socket, payload: { chatRoomId: string }) {
        try {
            const userId = client.data.userId;
            const chatRoomId = payload?.chatRoomId;

            if (!chatRoomId) {
                throw new WsException('Missing chatRoomId');
            }

            client.leave(chatRoomId);

            const onlineUsers = await this.chatService.getOnlineUsers(chatRoomId);
            this.server.to(chatRoomId).emit('userOnlineStatus', {
                userId,
                isOnline: false,
                onlineUsers
            });
        } catch (error) {
            console.error('Error in handleLeaveChatRoom:', error);
            if (error instanceof WsException) {
                client.emit('error', { message: error.message });
            } else {
                client.emit('error', { message: 'Failed to leave chat room' });
            }
        }
    }

    emitBroadcastToRooms(chatRoomIds: string[], messageContent: string, senderId: string) {
        const timestamp = new Date().toISOString();
        // Emit to all rooms - Socket.IO handles this efficiently internally
        const length = chatRoomIds.length;
        for (let i = 0; i < length; i++) {
            this.server.to(chatRoomIds[i]).emit('newMessage', {
                content: messageContent,
                sender: senderId,
                chatRoom: chatRoomIds[i],
                timestamp,
                isBroadcast: true
            });
        }
    }
}