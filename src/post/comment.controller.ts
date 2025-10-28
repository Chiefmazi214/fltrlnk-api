import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post(":postId")
    @UseGuards(AuthGuard)
    async createComment(@Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @Req() req: Request) {
        return this.commentService.createComment(req.user._id, postId, createCommentDto);
    }
    
    @Get('user')
    @UseGuards(AuthGuard)
    async getUserComments(@Req() req: Request) {
        return this.commentService.getUserComments(req.user._id);
    }

    
    @Get(':id')
    @UseGuards(AuthGuard)
    async getCommentById(@Param('id') id: string) {
        return this.commentService.getCommentById(id);
    }

    @Get('post/:id')
    @UseGuards(AuthGuard)
    async getCommentsByPost(@Param('id') id: string) {
        return this.commentService.getCommentsByPost(id);
    }


    @Put(':id')
    @UseGuards(AuthGuard)
    async updateComment(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req: Request) {
        return this.commentService.updateComment(req.user._id, id, updateCommentDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteComment(@Param('id') id: string, @Req() req: Request) {
        return this.commentService.deleteComment(req.user._id, id);
    }
}
