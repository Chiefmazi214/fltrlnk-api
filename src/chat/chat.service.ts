import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRoomRepositoryInterface } from './repositories/abstract/chat-room.repository-interface';
import { MessageRepositoryInterface } from './repositories/abstract/message.repository-interface';
import { ChatRoomDocument } from './models/chat-room.model';
import { MessageDocument } from './models/message.model';
import { Types } from 'mongoose';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UserService } from 'src/user/user.service';
import { ChatRoomType } from './chat.types';

@Injectable()
export class ChatService {
    constructor(
        @Inject(ChatRoomRepositoryInterface)
        private readonly chatRoomRepository: ChatRoomRepositoryInterface,
        @Inject(MessageRepositoryInterface)
        private readonly messageRepository: MessageRepositoryInterface,
        private readonly userService: UserService
    ) {}

    async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
        await this.userService.updateUserOnlineStatus(userId, isOnline);
    }

    async getOnlineUsers(chatRoomId: string): Promise<string[]> {
        const chatRoom = await this.getChatRoomById(chatRoomId);
        const onlineUsers = await this.userService.getOnlineUsers(chatRoom.users.map(user => user._id.toString()));
        return onlineUsers;
    }

    async canUserJoinRoom(userId: string, roomId: string): Promise<boolean> {
        const chatRoom = await this.chatRoomRepository.findOne({_id: new Types.ObjectId(roomId), users: { $in: [new Types.ObjectId(userId)] }});
        return chatRoom ? true : false;
    }

    async createMessage(userId: string, createMessageDto: CreateMessageDto): Promise<MessageDocument> {
        const { chatRoomId, content, attachmentIds } = createMessageDto;
        
        const chatRoom = await this.getChatRoomById(chatRoomId);
        console.log(chatRoom.users, 'chatRoom.users')
        let canJoin = chatRoom.users.some(user => user._id.toString() === userId);
        console.log(canJoin)
        if (!canJoin) {
            throw new NotFoundException('User not in chat room');
        }
        console.log(chatRoom._id, 'chatRoom._id')
        const message = await this.messageRepository.create({
            content,
            sender: new Types.ObjectId(userId),
            chatRoom: chatRoom._id,
            attachments: attachmentIds ? attachmentIds.map(id => new Types.ObjectId(id)) : []
        });

        return this.messageRepository.findById(message._id.toString(), [
            { path: 'sender', select: 'username profileImage' },
            { path: 'chatRoom', select: 'users' },
            { path: 'attachments' }
        ]);
    }

    async createChatRoom(userIds: string[], type: ChatRoomType): Promise<ChatRoomDocument> {
        const chatRoom = await this.chatRoomRepository.create({
            users: userIds.map(id => new Types.ObjectId(id)),
            type
        });
        return this.chatRoomRepository.findById(chatRoom._id.toString(), [
            { path: 'users', select: 'username profileImage' }
        ]);
    }

    async getUserChatRooms(userId: string, type?: ChatRoomType): Promise<ChatRoomDocument[]> {
        const query: any = { users: { $in: [new Types.ObjectId(userId)] } };
        if (type !== undefined) {
            query.type = type;
        }
        
        const rooms = await this.chatRoomRepository.findAll(
            query,
            [{ path: 'users', select: 'username profileImage' }]
        );

        const uniqueRoomsMap = new Map<string, ChatRoomDocument>();
        for (const room of rooms) {
            const key = room.users
                .map((u: any) => u._id?.toString?.() ?? u.toString())
                .sort()
                .join('-');
            if (!uniqueRoomsMap.has(key)) {
                uniqueRoomsMap.set(key, room);
            }
        }
        return Array.from(uniqueRoomsMap.values());
    }

    async getChatRoomById(chatRoomId: string): Promise<ChatRoomDocument> {
        const chatRoom = await this.chatRoomRepository.findById(chatRoomId, [
            { path: 'users', select: 'username profileImage' }
        ]);
        if (!chatRoom) {
            throw new NotFoundException('Chat room not found');
        }
        return chatRoom;
    }

    async getChatRoomMessages(chatRoomId: string): Promise<MessageDocument[]> {
        await this.getChatRoomById(chatRoomId); // Check if chat room exists
        return this.messageRepository.findAll(
            { chatRoom: new Types.ObjectId(chatRoomId) },
            [
                { path: 'sender', select: 'username profileImage' },
                { path: 'chatRoom', select: 'users' }
            ]
        );
    }

    async findChatRoomByUsers(userIds: string[], type: ChatRoomType): Promise<ChatRoomDocument | null> {
        const userObjectIds = userIds.map(id => new Types.ObjectId(id));
        const chatRoom = await this.chatRoomRepository.findOne({
            users: { 
                $all: userObjectIds,
                $size: userObjectIds.length
            },
            type
        }, [
            { path: 'users', select: 'username profileImage' }
        ]);

        return chatRoom;
    }

    async switchChatRoomType(chatRoomId: string, userId: string): Promise<ChatRoomDocument> {
        const chatRoom = await this.getChatRoomById(chatRoomId);
        if (!chatRoom.users.some(user => user._id.toString() === userId)) {
            throw new NotFoundException('User not in chat room');
        }
        if (chatRoom.type === ChatRoomType.GENERAL) {
            chatRoom.type = ChatRoomType.PRIMARY;
            await chatRoom.save();
        } else if (chatRoom.type === ChatRoomType.PRIMARY) {
            chatRoom.type = ChatRoomType.GENERAL;
            await chatRoom.save();
        }
        return chatRoom;
    }
}