import { Inject, Injectable } from '@nestjs/common';
import { AttachmentRepositoryInterface } from './repositories/abstract/attachment.repository-interface';
import { Attachment, AttachmentDocument } from './models/attachment.model';
import mongoose from 'mongoose';

@Injectable()
export class AttachmentService {
    constructor(
        @Inject(AttachmentRepositoryInterface)
        private readonly attachmentRepository: AttachmentRepositoryInterface
    ) { }

    async createAttachment(attachment: Partial<Attachment>): Promise<AttachmentDocument> {
        return this.attachmentRepository.create(attachment);
    }

    async getAttachmentById(id: string): Promise<AttachmentDocument> {
        return this.attachmentRepository.findById(id);
    }

    async getAttachmentByPath(path: string): Promise<AttachmentDocument> {
        return this.attachmentRepository.findOne({ path });
    }

    async getAttachmentsByUser(userId: string): Promise<AttachmentDocument[]> {
        return this.attachmentRepository.findAll({ user: new mongoose.Types.ObjectId(userId) });
    }

    async deleteAttachment(id: string): Promise<void> {
        await this.attachmentRepository.delete(id);
    }

}
