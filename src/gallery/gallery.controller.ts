import { Controller, Delete, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@Controller('gallery')
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @Post("upload")
    @UseInterceptors(FileInterceptor('attachment'))
    @UseGuards(AuthGuard)
    async uploadFileToGallery(@UploadedFile() attachment: Express.Multer.File, @Req() req: Request) {
        return this.galleryService.uploadFileToGallery(req.user._id, attachment);
    }

    @Get()
    @UseGuards(AuthGuard)
    async getGallery(@Req() req: Request) {
        return this.galleryService.getGallery(req.user._id);
    }

    @Get(":userId")
    async getGalleryByUserId(@Param("userId") userId: string) {
        return this.galleryService.getGallery(userId);
    }

    @Delete(":attachmentId")
    @UseGuards(AuthGuard)
    async deleteGalleryItem(@Param("attachmentId") attachmentId: string, @Req() req: Request) {
        return this.galleryService.deleteGalleryItem(req.user._id, attachmentId);
    }
}
