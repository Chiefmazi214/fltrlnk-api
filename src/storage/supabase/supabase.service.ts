import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageServiceInterface } from '../abstract/storage-service.interface';

@Injectable()
export class SupabaseService implements StorageServiceInterface {

    private supabase: SupabaseClient;
    private bucket: any;
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_PROJECT_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        this.bucket = this.supabase.storage.from(process.env.SUPABASE_BUCKET_NAME);
    }

    async uploadFile(file: Express.Multer.File) {
        try {
            const { data, error } = await this.bucket.upload(file.originalname, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });
            
            if (error) {
                throw new Error(error.message);
            }
            return data.path;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    async uploadFiles(files: Express.Multer.File[]) {
        const uploadPromises = files.map(file => this.uploadFile(file));
        return Promise.all(uploadPromises);
    }

    async getFileUrl(path: string) {
        const { data } = await this.bucket.createSignedUrl(path, 60 * 60 * 24 * 30);
        return data.signedUrl;
    }

    async getFilePublicUrl(path: string): Promise<string> {
        const { data } = await this.bucket.getPublicUrl(path);
        return data.publicUrl;
    }

    async getFilesPublicUrl(paths: string[]): Promise<string[]> {
        return Promise.all(paths.map(path => this.getFilePublicUrl(path)));
    }

    async getFilesUrls(paths: string[]) {
        const { data, error } = await this.bucket.createSignedUrls(paths, 60 * 60 * 24 * 30);
        if (error) {
            throw new Error(error.message);
        }
        return data.signedUrls;
    }

    async deleteFile(path: string) {
        const { error } = await this.bucket.remove([path]);
        if (error) {
            throw new Error(error.message);
        }
    }
}
