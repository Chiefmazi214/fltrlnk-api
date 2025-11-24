// import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody, OnGatewayInit } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { ChatService } from './chat.service';
// import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
// import { CreateMessageDto } from './dtos/create-message.dto';
// import { CreateContractDto } from './dtos/create-contract.dto';
// import { JwtService } from '@nestjs/jwt';
// import { ContractStatus } from './enums/contract-status.enum';

// @WebSocketGateway(parseInt(process.env.CHAT_SERVER_PORT || '3000'), {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//     credentials: true,
//     allowedHeaders: ['Authorization', 'Content-Type'],
//   },
//   namespace: '/chat',
//   transports: ['websocket', 'polling'],
//   allowEIO3: true,
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   connectTimeout: 45000,
//   path: '/socket.io/',
//   serveClient: false,
//   adapter: null, 
//   allowUpgrades: true,
//   maxHttpBufferSize: 1e8
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
//   @WebSocketServer()
//   server: Server;

//   private readonly wsAuthGuard: WsAuthGuard;

//   constructor(
//     private readonly chatService: ChatService,
//     private readonly jwtService: JwtService,
//   ) {
//     console.log('ChatGateway initialized');
//     this.wsAuthGuard = new WsAuthGuard(jwtService);
//   }

//   afterInit(server: Server) {
//     console.log('WebSocket server initialized');
//     this.server = server;
    
//     server.on('connection', (socket) => {
//       console.log('Raw socket connection received');
//       console.log('Socket ID:', socket.id);
//       console.log('Socket headers:', socket.handshake.headers);

//       // Listen for all incoming messages
//       socket.onAny((eventName, ...args) => {
//         console.log('Received event:', eventName);
//         console.log('Event arguments:', args);
//       });
//     });
//   }

//   async handleConnection(client: Socket) {
//     try {
//       console.log('=== New WebSocket Connection ===');
//       console.log('Socket ID:', client.id);
//       console.log('Client headers:', client.handshake.headers);
//       console.log('Auth header:', client.handshake.headers.authorization);
      
//       // Authenticate the connection
//       const context = {
//         switchToWs: () => ({
//           getClient: () => client,
//         }),
//       };
      
//       const isAuthenticated = await this.wsAuthGuard.canActivate(context as any);
//       console.log('Authentication result:', isAuthenticated);
      
//       if (!isAuthenticated) {
//         console.error('Authentication failed');
//         client.disconnect();
//         return;
//       }

//       console.log("Client Data after auth:", client.data);
      
//       if (!client.data || !client.data.user) {
//         console.error('No user data found in socket');
//         client.disconnect();
//         return;
//       }

//       const userId = client.data.user.id;
//       console.log('Connected user ID:', userId);
      
//       if (!userId) {
//         console.error('No user ID found');
//         client.disconnect();
//         return;
//       }

//       await this.chatService.updateUserOnlineStatus(userId, true);
//       console.log('User online status updated');
      
//       // Join all chat rooms the user is part of
//       const userRooms = await this.chatService.getUserChatRooms(userId);
//       console.log('User rooms:', userRooms);
      
//       if (userRooms && userRooms.length > 0) {
//         userRooms.forEach((room) => {
//           console.log(`Joining room: ${room.id}`);
//           client.join(room.id);
//         });
//       } else {
//         console.log('No rooms found for user');
//       }

//       // Notify other users that this user is online
//       this.server.emit('userOnlineStatus', { userId, isOnline: true });
//       console.log('Connection successful and status broadcasted');
//     } catch (error) {
//       console.error('Connection error:', error);
//       console.error('Error stack:', error.stack);
//       client.disconnect();
//     }
//   }

//   async handleDisconnect(client: Socket) {
//     try {
//       console.log('=== Disconnecting WebSocket Connection ===');
//       const userId = client.data.user.id;
//       await this.chatService.updateUserOnlineStatus(userId, false);
      
//       // Notify other users that this user is offline
//       this.server.emit('userOnlineStatus', { userId, isOnline: false });
//     } catch (error) {
//       // Handle error
//     }
//   }

//   @SubscribeMessage('joinRoom')
//   async handleJoinRoom(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() roomId: string,
//   ) {
//     const userId = client.data.user?.id;
//     const canJoin = await this.chatService.canUserJoinRoom(userId, roomId);
    
//     if (canJoin) {
//       client.join(roomId);
//       return { success: true };
//     }
//     return { success: false, message: 'Cannot join room' };
//   }

//   @SubscribeMessage('leaveRoom')
//   async handleLeaveRoom(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() roomId: string,
//   ) {
//     client.leave(roomId);
//     return { success: true };
//   }

//   @SubscribeMessage('sendMessage')
//   async handleMessage(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: any,
//   ) {
//     try {
//       console.log('=== Sending Message ===');
//       console.log('Raw Message Data:', data);

//       // Parse the message data if it's a string
//       let messageData;
//       try {
//         messageData = typeof data === 'string' ? JSON.parse(data) : data;
//         messageData = messageData.data || messageData;
//       } catch (parseError) {
//         console.error('Error parsing message data:', parseError);
//         throw new Error('Invalid message format');
//       }

//       console.log('Processed Message Data:', messageData);

//       // Validate required fields
//       if (!messageData.chatRoomId || !messageData.content) {
//         throw new Error('Missing required fields: chatRoomId and content are required');
//       }

//       const createMessageDto: CreateMessageDto = {
//         chatRoomId: messageData.chatRoomId,
//         content: messageData.content,
//         attachmentIds: messageData.attachmentIds || [],
//       };
      
//       if (!client?.data?.user?.id) {
//         throw new Error('User not authenticated');
//       }

//       const userId = client.data.user.id;
//       console.log('Sending message as user:', userId);
      
//       // Validate chat room access
//       const canAccess = await this.chatService.canUserJoinRoom(userId, createMessageDto.chatRoomId);
//       if (!canAccess) {
//         throw new Error('Cannot access this chat room');
//       }

//       const message = await this.chatService.createMessage(userId, createMessageDto);
//       console.log('Message created:', message);
      
//       // Emit the message to all users in the chat room
//       this.server.to(createMessageDto.chatRoomId).emit('newMessage', message);
//       console.log('Message broadcasted to room');
      
//       return { success: true, message };
//     } catch (error) {
//       console.error('Error sending message:', error);
//       const errorMessage = error instanceof Error ? error.message : 'An error occurred while sending the message';
//       client.emit('error', { success: false, message: errorMessage });
//       return { success: false, error: errorMessage };
//     }
//   }

//   @SubscribeMessage('typing')
//   async handleTyping(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: any,
//   ) {
//     try {
//       console.log('=== Typing Event Received ===');
//       console.log('Raw typing data:', data);

//       // Parse the data if it's a string
//       let typingData;
//       try {
//         typingData = typeof data === 'string' ? JSON.parse(data) : data;
//         typingData = typingData.data || typingData;
//       } catch (parseError) {
//         console.error('Error parsing typing data:', parseError);
//         throw new Error('Invalid typing data format');
//       }

//       console.log('Processed typing data:', typingData);

//       if (!typingData.chatRoomId || typeof typingData.isTyping !== 'boolean') {
//         throw new Error('Invalid typing data. Required fields: chatRoomId (string) and isTyping (boolean)');
//       }

//       if (!client?.data?.user?.id) {
//         throw new Error('User not authenticated');
//       }

//       const userId = client.data.user.id;
//       console.log('User typing status update:', {
//         userId,
//         chatRoomId: typingData.chatRoomId,
//         isTyping: typingData.isTyping
//       });

//       // Validate chat room access
//       const canAccess = await this.chatService.canUserJoinRoom(userId, typingData.chatRoomId);
//       if (!canAccess) {
//         throw new Error('Cannot access this chat room');
//       }

//       // Emit typing status to all users in the chat room except the sender
//       client.to(typingData.chatRoomId).emit('userTyping', {
//         userId,
//         isTyping: typingData.isTyping
//       });

//       console.log('Typing status broadcasted to room:', typingData.chatRoomId);
//       return { success: true };
//     } catch (error) {
//       console.error('Error handling typing event:', error);
//       const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing typing status';
//       client.emit('error', { success: false, message: errorMessage });
//       return { success: false, error: errorMessage };
//     }
//   }

//   @SubscribeMessage('createContract')
//   async handleCreateContract(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: any,
//   ) {
//     try {
//       console.log('=== Create Contract Event Received ===');
//       console.log('Raw contract data:', data);

//       // Parse the data if it's a string
//       let contractData;
//       try {
//         contractData = typeof data === 'string' ? JSON.parse(data) : data;
//         contractData = contractData.data || contractData;
//       } catch (parseError) {
//         console.error('Error parsing contract data:', parseError);
//         throw new Error('Invalid contract data format');
//       }

//       console.log('Processed contract data:', contractData);

//       // Validate required fields
//       if (!contractData.receiverId || 
//           !contractData.amount || !contractData.amountCurrency || 
//           !contractData.startDate || !contractData.deadline) {
//         throw new Error('Missing required fields for contract creation');
//       }

//       const createContractDto: CreateContractDto = {
//         receiverId: contractData.receiverId,
//         amount: Number(contractData.amount),
//         amountCurrency: contractData.amountCurrency,
//         startDate: contractData.startDate,
//         deadline: contractData.deadline,
//         description: contractData.description,
//         skillLevelIds: contractData.skillLevelIds,
//         milestones: contractData.milestones
//       };

//       if (!client?.data?.user?.id) {
//         throw new Error('User not authenticated');
//       }

//       const userId = client.data.user.id;
//       console.log('Creating contract as user:', userId);
      
//       const contract = await this.chatService.createContract(userId, createContractDto);
//       console.log('Contract created:', contract);
      
//       // Emit the contract to all users in the chat room
//       this.server.to(contract.chatRoomId).emit('newContract', contract);
//       console.log('Contract broadcasted to room');
      
//       return { success: true, contract };
//     } catch (error) {
//       console.error('Error creating contract:', error);
//       const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the contract';
//       client.emit('error', { success: false, message: errorMessage });
//       return { success: false, error: errorMessage };
//     }
//   }

//   @SubscribeMessage('acceptContract')
//   async handleAcceptContract(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: any,
//   ) {
//     try {
//       console.log('=== Accept Contract Event Received ===');
//       console.log('Raw contract data:', data);

//       let contractData;
//       try {
//         contractData = typeof data === 'string' ? JSON.parse(data) : data;
//         contractData = contractData.data || contractData;
//       } catch (parseError) {
//         console.error('Error parsing contract data:', parseError);
//         throw new Error('Invalid contract data format');
//       }

//       console.log('Processed contract data:', contractData);

//       if (!contractData.contractId) {
//         throw new Error('Missing required field: contractId');
//       }

//       if (!client?.data?.user?.id) {
//         throw new Error('User not authenticated');
//       }

//       const userId = client.data.user.id;
//       console.log('Accepting contract as user:', userId);
      
//       const contract = await this.chatService.acceptContract(userId, contractData.contractId);
//       console.log('Contract accepted:', contract);
      
//       this.server.to(contract.chatRoomId).emit('contractUpdated', contract);
//       console.log('Contract update broadcasted to room');
      
//       return { success: true, contract };
//     } catch (error) {
//       console.error('Error accepting contract:', error);
//       const errorMessage = error instanceof Error ? error.message : 'An error occurred while accepting the contract';
//       client.emit('error', { success: false, message: errorMessage });
//       return { success: false, error: errorMessage };
//     }
//   }

//   @SubscribeMessage('updateContractStatus')
//   async handleUpdateContractStatus(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: any,
//   ) {
//     try {
//       console.log('=== Update Contract Status Event Received ===');
//       console.log('Raw contract data:', data);

//       let contractData;
//       try {
//         contractData = typeof data === 'string' ? JSON.parse(data) : data;
//         contractData = contractData.data || contractData;
//       } catch (parseError) {
//         console.error('Error parsing contract data:', parseError);
//         throw new Error('Invalid contract data format');
//       }

//       console.log('Processed contract data:', contractData);

//       // Validate required fields
//       if (!contractData.contractId || !contractData.status) {
//         throw new Error('Missing required fields: contractId and status are required');
//       }

//       if (!client?.data?.user?.id) {
//         throw new Error('User not authenticated');
//       }

//       const userId = client.data.user.id;
//       console.log('Updating contract as user:', userId);
      
//       const contract = await this.chatService.updateContractStatus(
//         userId,
//         contractData.contractId,
//         contractData.status as ContractStatus
//       );
//       console.log('Contract updated:', contract);
      
//       // Emit the updated contract to all users in the chat room
//       this.server.to(contract.chatRoomId).emit('contractUpdated', contract);
//       console.log('Contract update broadcasted to room');
      
//       return { success: true, contract };
//     } catch (error) {
//       console.error('Error updating contract:', error);
//       const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the contract';
//       client.emit('error', { success: false, message: errorMessage });
//       return { success: false, error: errorMessage };
//     }
//   }
// } 