import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ConnectionRepositoryInterface } from './repositories/abstract/connection.repository-interface';
import { Connection } from 'mongoose';
import { ConnectionDocument, ConnectionStatus } from './models/connection.model';
import { PopulationOptions } from 'src/common/repository/abstract/base.repository';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { SendConnectionDto } from './dtos/send-connection.dto';
import { ChatService } from 'src/chat/chat.service';
import { FollowService } from './follow.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/models/notification.model';
import { ChatRoomType } from 'src/chat/models/chat-room.model';

@Injectable()
export class ConnectionService {
    constructor(
        @Inject(ConnectionRepositoryInterface)
        private readonly connectionRepository: ConnectionRepositoryInterface,
        private readonly chatService: ChatService,
        private readonly followService: FollowService,
        private readonly notificationService: NotificationService
    ) {}

    async sendConnectionRequest(userId: string, connectionId: string, sendConnectionDto: SendConnectionDto): Promise<ConnectionDocument> {
        if (userId === connectionId) {
            throw new BadRequestException('You cannot send a connection request to yourself');
        }

        const existingConnection = await this.connectionRepository.findOne({
            $or: [
                { requester: userId, recipient: connectionId },
                { requester: connectionId, recipient: userId }
            ]
        });

        if (existingConnection) {
            throw new BadRequestException('Connection already exists between these users');
        }

        const connection = await this.connectionRepository.create({
            requester: userId,
            recipient: connectionId,
            status: ConnectionStatus.PENDING,
            message: sendConnectionDto.message
        });
        return connection;
    }

    async getConnectionRequests(userId: string, paginationDto: PaginationDto): Promise<PaginatedResultDto<ConnectionDocument>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [connections, total] = await Promise.all([
            this.connectionRepository.findAll(
                {
                    recipient: userId,
                    status: ConnectionStatus.PENDING
                },
                [
                  { path: 'requester', select: 'displayName username profileImage' },
                  { path: 'recipient', select: 'displayName username profileImage' }
                ],
                { skip, limit }
            ),
            this.connectionRepository.count({
                recipient: userId,
                status: ConnectionStatus.PENDING
            })
        ]);

        return {
            data: connections,
            total,
            page,
            limit
        };
    }

    async acceptConnectionRequest(userId: string, connectionId: string): Promise<Object> {
        const connection = await this.connectionRepository.findOne({
            _id: connectionId,
            recipient: userId,
            status: ConnectionStatus.PENDING
        });

        if (!connection) {
            throw new BadRequestException('Connection request not found or already processed');
        }

        const updatedConnection = await this.connectionRepository.update(connectionId, {
            status: ConnectionStatus.ACCEPTED
        });

        // Try to create mutual follow relationships, ignore if already following
        await Promise.all([
            this.followService.followUser(userId, connection.requester.toString()).catch(() => {}),
            this.followService.followUser(connection.requester.toString(), userId).catch(() => {}),
            this.notificationService.createNotification({
                actorId: userId,
                recipientId: connection.requester.toString(),
                type: NotificationType.CONNECTION_REQUEST,
                message: `${userId} accepted your connection request`
            })
        ]);

        const chat = await this.chatService.createChatRoom([connection.requester, connection.recipient], ChatRoomType.PRIMARY);
        return {
            connection: updatedConnection,
            chatRoomId: chat._id
        };
    }

    async rejectConnectionRequest(userId: string, connectionId: string): Promise<ConnectionDocument> {
        const connection = await this.connectionRepository.findOne({
            _id: connectionId,
            recipient: userId,
            status: ConnectionStatus.PENDING
        });

        if (!connection) {
            throw new BadRequestException('Connection request not found or already processed');
        }

        const updatedConnection = await this.connectionRepository.update(connectionId, {
            status: ConnectionStatus.REJECTED
        });
        return updatedConnection;
    }

    async getUserConnections(userId: string, paginationDto: PaginationDto): Promise<PaginatedResultDto<ConnectionDocument>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const populateOptions: PopulationOptions[] = [
            { path: 'requester', select: 'name email profileImage' },
            { path: 'recipient', select: 'name email profileImage' }
        ];
        
        const [connections, total] = await Promise.all([
            this.connectionRepository.findAll(
                {
                    $and: [
                        { $or: [{ requester: userId }, { recipient: userId }] },
                        { status: ConnectionStatus.ACCEPTED }
                    ]
                },
                populateOptions,
                { skip, limit }
            ),
            this.connectionRepository.count({
                $and: [
                    { $or: [{ requester: userId }, { recipient: userId }] },
                    { status: ConnectionStatus.ACCEPTED }
                ]
            })
        ]);

        return {
            data: connections,
            total,
            page,
            limit
        };
    }

    async getConnectionRequestsByRequester(userId: string): Promise<ConnectionDocument> {
        return this.connectionRepository.findPendingByRequester(userId);
    }

    async getRelationshipStatus(userId: string, targetUserId: string): Promise<{
        isFollowing: boolean;
        isFollowedBy: boolean;
        connectionStatus: ConnectionStatus | null;
    }> {
        // Check if user is following target
        const isFollowing = await this.followService.isFollowing(userId, targetUserId);
        
        // Check if target is following user
        const isFollowedBy = await this.followService.isFollowing(targetUserId, userId);
        
        // Check connection status
        const connection = await this.connectionRepository.findOne({
            $or: [
                { requester: userId, recipient: targetUserId },
                { requester: targetUserId, recipient: userId }
            ]
        });

        return {
            isFollowing,
            isFollowedBy,
            connectionStatus: connection ? connection.status : null
        };
    }
}
