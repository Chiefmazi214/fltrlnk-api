import { Controller, Post, Body, UseGuards, Req, Param, UseInterceptors, UploadedFiles, Get } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    @UseGuards(AuthGuard)
    createPost(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
        return this.postService.createPost(req.user._id, createPostDto);
    }

    @Get(':id')
    getPost(@Param('id') id: string, @Req() req: Request) {
        return this.postService.getPost(id);
    }

    @Get()
    getPosts() {
        return this.postService.getPosts();
    }

    @Get('user/:id')
    getPostsByUser(@Param('id') id: string) {
        return this.postService.getPostsByUser(id);
    }

    @Post(':postId/attachments')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('attachments'))
    uploadAttachments(@Param('postId') postId: string, @UploadedFiles() attachments: Express.Multer.File[], @Req() req: Request) {
        attachments.forEach(attachment => {
            console.log(attachment.originalname);
        });
        console.log(req.user._id);
        return this.postService.uploadAttachments(postId, req.user._id, attachments);
    }

    @Post(':postId/like')
    @UseGuards(AuthGuard)
    likePost(@Param('postId') postId: string, @Req() req: Request) {
        return this.postService.likePost(postId, req.user._id);
    }

    @Post(':postId/unlike')
    @UseGuards(AuthGuard)
    unlikePost(@Param('postId') postId: string, @Req() req: Request) {
        return this.postService.unlikePost(postId, req.user._id);
    }
    
    
    
    
}