import { Controller, Get, Post, Body, Param, UseGuards, UnauthorizedException, Req, BadRequestException, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { IsArray, IsString, ArrayMinSize, IsEnum } from 'class-validator';
import { ChatRoomType } from './models/chat-room.model';

class CreateChatRoomDto {
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    userIds: string[];

    @IsEnum(ChatRoomType)
    type: ChatRoomType;
}

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('room/:id/messages')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get messages for a specific chat room' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns list of messages',
        schema: {
            example: [{
                _id: '64f123456789abcdef123459',
                chatRoom: '64f123456789abcdef123456',
                sender: {
                    _id: '64f123456789abcdef123457',
                    username: 'user1',
                    profileImage: 'https://example.com/image1.jpg'
                },
                content: 'Hello!',
                createdAt: '2024-03-20T10:01:00.000Z'
            }]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - User not in chat room' })
    async getChatRoomMessages(@Param('id') chatRoomId: string, @Req() req: Request) {
        //console.log(chatRoomId)
        const canAccess = await this.chatService.canUserJoinRoom(req.user._id, chatRoomId);
        if (!canAccess) {
            throw new UnauthorizedException('You do not have access to this chat room');
        }
        return this.chatService.getChatRoomMessages(chatRoomId);
    }

    @Post('room')
    @ApiOperation({ summary: 'Create a new chat room' })
    @ApiResponse({ 
        status: 201, 
        description: 'Chat room created successfully',
        schema: {
            example: {
                _id: '64f123456789abcdef123456',
                users: ['64f123456789abcdef123457', '64f123456789abcdef123458'],
                createdAt: '2024-03-20T10:00:00.000Z',
                updatedAt: '2024-03-20T10:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
    async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto, @Req() req: Request) {
        
        if (!createChatRoomDto.userIds) {
            throw new BadRequestException('userIds is required');
        }

        if (!createChatRoomDto.userIds.includes(req.user._id)) {
            createChatRoomDto.userIds.push(req.user._id);
        }

        const existingChatRoom = await this.chatService.findChatRoomByUsers(createChatRoomDto.userIds, createChatRoomDto.type);
        if (existingChatRoom) {
            return existingChatRoom;
        }

        return this.chatService.createChatRoom(createChatRoomDto.userIds, createChatRoomDto.type);
    }


    @Get('room/switch/:id')
    @ApiOperation({ summary: 'Switch chat room type' })
    @ApiResponse({ status: 200, description: 'Chat room type switched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
    async switchChatRoomType(@Param('id') chatRoomId: string, @Req() req: Request) {
        return this.chatService.switchChatRoomType(chatRoomId, req.user._id);
    }

    @Get('rooms')
    @ApiOperation({ summary: 'Get all chat rooms for current user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns list of chat rooms',
        schema: {
            example: [{
                _id: '64f123456789abcdef123456',
                users: [{
                    _id: '64f123456789abcdef123457',
                    username: 'user1',
                    profileImage: 'https://example.com/image1.jpg'
                }, {
                    _id: '64f123456789abcdef123458',
                    username: 'user2',
                    profileImage: 'https://example.com/image2.jpg'
                }],
                createdAt: '2024-03-20T10:00:00.000Z',
                updatedAt: '2024-03-20T10:00:00.000Z'
            }]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUserChatRooms(@Req() req: Request, @Query('type') type?: ChatRoomType) {
        return this.chatService.getUserChatRooms(req.user._id, type);
    }
}
