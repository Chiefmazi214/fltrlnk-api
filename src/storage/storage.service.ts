import { Injectable, Inject } from '@nestjs/common';
import { StorageServiceInterface } from './abstract/storage-service.interface';

@Injectable()
export class StorageService {
    constructor(
        @Inject(StorageServiceInterface)
        private readonly storageProvider: StorageServiceInterface
    ) {}

    async uploadFile(file: Express.Multer.File) {
        return this.storageProvider.uploadFile(file);
    }

    async uploadFiles(files: Express.Multer.File[]) {
        return this.storageProvider.uploadFiles(files);
    }

    async getFileUrl(fileUrl: string) {
        return this.storageProvider.getFileUrl(fileUrl);
    }

    async getFilesUrls(fileUrls: string[]) {
        return this.storageProvider.getFilesUrls(fileUrls);
    }

    async deleteFile(fileUrl: string) {
        return this.storageProvider.deleteFile(fileUrl);
    }

    async getFilePublicUrl(path: string) {
        return this.storageProvider.getFilePublicUrl(path);
    }

    async getFilesPublicUrl(paths: string[]) {
        return this.storageProvider.getFilesPublicUrl(paths);
    }
    
}
