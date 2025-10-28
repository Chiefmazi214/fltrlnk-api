import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepositoryInterface } from './repositories/abstract/comment.repository-interface';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { PostService } from './post.service';
import { PostRepository } from './repositories/mongoose/post.repository.mongoose';
import { PostRepositoryInterface } from './repositories/abstract/post.repository-interface';
import { Types } from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/models/notification.model';

@Injectable()
export class CommentService {
    constructor(
        @Inject(CommentRepositoryInterface)
        private commentRepository: CommentRepositoryInterface,
        @Inject(PostRepositoryInterface)
        private postRepository: PostRepositoryInterface,
        private notificationService: NotificationService
    ) {}
    
    async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto) {
        const comment = await this.commentRepository.create({
            ...createCommentDto,
            user: new Types.ObjectId(userId),
            post: new Types.ObjectId(postId)
        });
        const post = await this.postRepository.findOne({ _id: postId });
        await this.postRepository.update(postId, { comments: [...post.comments, comment] }, [{ path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
        await this.notificationService.createNotification({
            recipientId: post.user.toString(),
            type: NotificationType.COMMENT,
            actorId: userId,
            postId: postId,
            commentText: createCommentDto.content,
            message: `${userId} commented on your post`
        });
        return comment;
    }

    async getUserComments(userId: string) {
        const comments = await this.commentRepository.findAll({ user: new Types.ObjectId(userId) }, [{ path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
        return comments;
    }

    async getCommentsByPost(postId: string) {
        const comments = await this.commentRepository.findAll({ post: new Types.ObjectId(postId) }, [{ path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
        return comments;
    }

    async getCommentById(commentId: string) {
        const comment = await this.commentRepository.findOne({ _id: new Types.ObjectId(commentId) }, [{ path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
        return comment;
    }

    async updateComment(userId: string, commentId: string, updateCommentDto: UpdateCommentDto) {
        const comment = await this.commentRepository.findOne({ _id: new Types.ObjectId(commentId), user: new Types.ObjectId(userId) });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return this.commentRepository.update(commentId, updateCommentDto, [{ path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }

    async deleteComment(userId: string, commentId: string) {
        const comment = await this.commentRepository.findOne({ _id: new Types.ObjectId(commentId), user: new Types.ObjectId(userId) });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        await this.commentRepository.delete(commentId);
        return comment;
    }
}
