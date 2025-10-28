export const StorageServiceInterface = 'StorageServiceInterface';

export interface StorageServiceInterface {
  uploadFile(file: Express.Multer.File): Promise<string>;
  uploadFiles(files: Express.Multer.File[]): Promise<string[]>;
  getFileUrl(fileUrl: string): Promise<string>;
  getFilesUrls(fileUrls: string[]): Promise<string[]>;
  deleteFile(fileUrl: string): Promise<void>;
  getFilePublicUrl(path: string): Promise<string>;
  getFilesPublicUrl(paths: string[]): Promise<string[]>;
}

