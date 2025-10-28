import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GalleryRepositoryInterface } from './repositories/abstract/gallery.repository-interface';
import { GalleryDocument } from './models/gallery.model';
import { AttachmentService } from 'src/attachment/attachment.service';
import { UserService } from 'src/user/user.service';
import { StorageService } from 'src/storage/storage.service';
import { AttachmentType } from 'src/attachment/models/attachment.model';

@Injectable()
export class GalleryService {
    constructor(
        @Inject(GalleryRepositoryInterface)
        private readonly galleryRepository: GalleryRepositoryInterface,
        private readonly attachmentService: AttachmentService,
        private readonly userService: UserService,
        private readonly storageService: StorageService,
    ) {}

    async create(gallery: GalleryDocument): Promise<GalleryDocument> {
        return this.galleryRepository.create(gallery);
    }

    async uploadFileToGallery(userId: string, file: Express.Multer.File): Promise<any> {
        const user = await this.userService.getUserById(userId);
        const populate = [{path: 'attachments'}, {path: 'user', select: 'username email profileImage'}];
        let gallery = await this.galleryRepository.findOne({user: userId}, populate);
        if (!gallery) {
            gallery = await this.galleryRepository.create({
                user: user,
                attachments: [],
            }, populate);
        }

        file.originalname = file.originalname.replace(/\s+/g, '_');
        file.originalname = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
        file.originalname = `${user.username}-${file.originalname}-${Date.now()}`;

        const uploadFilePath = await this.storageService.uploadFile(file);

        const attachment = await this.attachmentService.createAttachment({
            filename: file.originalname,
            path: uploadFilePath,
            url: await this.storageService.getFilePublicUrl(uploadFilePath),
            type: AttachmentType.DOCUMENT
        });

        gallery.attachments.push(attachment);
        const updatedGallery = await gallery.save();

        return updatedGallery;
    }

    async deleteGalleryItem(userId: string, attachmentId: string): Promise<any> {
        const gallery = await this.galleryRepository.findOne({ user: userId });
        if (!gallery) {
            throw new NotFoundException('Gallery not found');
        }

        const attachment = gallery.attachments.find(attachment => attachment._id.toString() === attachmentId);
        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        await this.storageService.deleteFile(attachment.path);

        await this.attachmentService.deleteAttachment(attachmentId);
        gallery.attachments = gallery.attachments.filter(attachment => attachment._id.toString() !== attachmentId);
        await gallery.save();

        return gallery;
    }

    async getGallery(userId: string): Promise<GalleryDocument> {
        const populate = [{path: 'attachments', select: 'url type'}, {path: 'user', select: 'username email profileImage'}];
        const gallery = await this.galleryRepository.findOne({user: userId}, populate);

        return gallery;
    }
}
