import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepositoryInterface } from './repositories/abstract/post.repository-interface';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostDocument, PostStatus } from './models/post.model';
import { Types } from 'mongoose';
import { UpdatePostDto } from './dtos/update-post.dto';
import { StorageService } from 'src/storage/storage.service';
import { AttachmentService } from 'src/attachment/attachment.service';
import { AttachmentDocument, AttachmentType } from 'src/attachment/models/attachment.model';
import { UserService } from 'src/user/user.service';
import { CommentDocument } from './models/comment.model';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/models/notification.model';
@Injectable()
export class PostService {
    constructor(
        @Inject(PostRepositoryInterface)
        private postRepository: PostRepositoryInterface,
        private storageService: StorageService,
        private attachmentService: AttachmentService,
        private userService: UserService,
        private notificationService: NotificationService
    ) { }

    async getPost(postId: string): Promise<PostDocument> {
        const post = await this.postRepository.findOne(
            { _id: postId },
            [
                { path: 'attachments', select: 'filename path type url' },
                { path: 'comments', select: 'content user createdAt updatedAt post' },
                { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' },
                { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }
            ]
        );
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (post.comments && post.comments.length > 0) {
            await post.populate({ path: 'comments.user', select: 'displayName username profileImage' });
        }
        return post;
    }

    async getPosts(): Promise<PostDocument[]> {
        return this.postRepository.findAll({}, [{ path: 'attachments', select: 'filename path type url' }, { path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }, { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }

    async getPostsByUser(userId: string): Promise<PostDocument[]> {
        return this.postRepository.findAll({ user: new Types.ObjectId(userId) }, [{ path: 'attachments', select: 'filename path type url' }, { path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }, { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }

    async createPost(userId: string, createPostDto: CreatePostDto): Promise<PostDocument> {
        console.log(userId, createPostDto);
        return this.postRepository.create({
            user: new Types.ObjectId(userId),
            description: createPostDto.description,
            location: createPostDto.location,
            status: PostStatus.DRAFT
        });
    }

    async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<PostDocument> {
        return this.postRepository.update(postId, updatePostDto, [{ path: 'attachments', select: 'filename path type url' }, { path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }, { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }

    async deletePost(postId: string): Promise<PostDocument> {
        return this.postRepository.delete(postId);
    }

    async uploadAttachments(postId: string, userId: string, attachments: Express.Multer.File[]): Promise<PostDocument> {
        let uploadedAttachments: AttachmentDocument[] = [];
        console.log({ _id: new Types.ObjectId(postId), user: new Types.ObjectId(userId) })
        const user = await this.userService.getUserById(userId);
        const post = await this.postRepository.findOne({ _id: new Types.ObjectId(postId), user: new Types.ObjectId(userId) });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        for (const attachment of attachments) {
            attachment.originalname = `${attachment.originalname}-${Date.now()}`;

            const filePath = await this.storageService.uploadFile(attachment);

            const newAttachment = await this.attachmentService.createAttachment({
                filename: attachment.originalname,
                path: filePath,
                type: AttachmentType.POST_IMAGE,
                url: await this.storageService.getFilePublicUrl(filePath),
                user: user
            });
            uploadedAttachments.push(newAttachment);
        }
        return this.postRepository.update(postId, { attachments: uploadedAttachments, status: PostStatus.PUBLISHED }, [{ path: 'attachments', select: 'filename path type url' }, { path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }, { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }

    async likePost(postId: string, userId: string): Promise<PostDocument> {
        const post = await this.getPost(postId);
        const notification = await this.notificationService.createNotification({
            actorId: userId,
            postId: postId,
            type: NotificationType.LIKE,
            recipientId: post.user._id.toString(),
            message: `${userId} liked your post`
        });
        return this.postRepository.update(postId, { likes: [...post.likes, new Types.ObjectId(userId)] }, [{ path: 'attachments', select: 'filename path type url' }, { path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }, { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }

    async unlikePost(postId: string, userId: string): Promise<PostDocument> {
        const post = await this.getPost(postId);
        return this.postRepository.update(postId, { likes: post.likes.filter(like => like._id.toString() !== userId) }, [{ path: 'attachments', select: 'filename path type url' }, { path: 'comments', select: 'content user createdAt updatedAt post' }, { path: 'user', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }, { path: 'likes', select: 'username email profileImage attributes displayName location lifestyleInfo isOnline' }]);
    }
}
