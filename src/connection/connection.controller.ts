import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { FollowService } from './follow.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { SendConnectionDto } from './dtos/send-connection.dto';
import { CheckFollowersDto } from './dtos/check-followers.dto';
import { CommonParams } from 'src/common/dtos/common.dtos';
import { LikeService } from './like.service';
import { LikeParams } from './dtos/like.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LikeType } from './like.enum';

@Controller('connection')
export class ConnectionController {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly followService: FollowService,
    private readonly likeService: LikeService,
  ) {}

  @Post('follow/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async follow(@Req() req: Request, @Param('id') id: string) {
    return this.followService.followUser(req.user?._id, id);
  }

  @Post('unfollow/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async unfollow(@Req() req: Request, @Param('id') id: string) {
    return this.followService.unfollowUser(req.user?._id, id);
  }

  @Get('followers/:id')
  async getFollowers(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.followService.getFollowers(id, paginationDto);
  }

  @Get('following/:id')
  async getFollowing(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.followService.getFollowing(id, paginationDto);
  }

  @Post('request/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async request(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() sendConnectionDto: SendConnectionDto,
  ) {
    return this.connectionService.sendConnectionRequest(
      req.user?._id,
      id,
      sendConnectionDto,
    );
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getConnectionRequests(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.connectionService.getConnectionRequests(
      req.user?._id,
      paginationDto,
    );
  }

  @Post('requests/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async acceptRequest(@Req() req: Request, @Param('id') id: string) {
    return this.connectionService.acceptConnectionRequest(req.user?._id, id);
  }

  @Post('requests/:id/reject')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async rejectRequest(@Req() req: Request, @Param('id') id: string) {
    return this.connectionService.rejectConnectionRequest(req.user?._id, id);
  }

  @Get('connections')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getUserConnections(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.connectionService.getUserConnections(
      req.user?._id,
      paginationDto,
    );
  }

  @Get('relationship/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getRelationshipStatus(
    @Req() req: Request,
    @Param('id') targetUserId: string,
  ) {
    return this.connectionService.getRelationshipStatus(
      req.user?._id,
      targetUserId,
    );
  }

  @Get('requests/requester')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getConnectionRequestsByRequester(@Req() req: Request) {
    return this.connectionService.getConnectionRequestsByRequester(
      req.user?._id,
    );
  }

  @Post('check')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async checkFollowers(
    @Req() req: Request,
    @Body() checkFollowersDto: CheckFollowersDto,
  ) {
    return this.followService.checkMultipleFollowers(
      req.user?._id,
      checkFollowersDto.userIds,
    );
  }

  @Post('like/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async likeItem(
    @Req() req: Request,
    @Body() likeParams: LikeParams,
    @Param() params: CommonParams,
  ) {
    return this.likeService.likeItem(req.user?._id, likeParams.type, params.id);
  }

  @Delete('like/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async unlikeItem(
    @Req() req: Request,
    @Body() likeParams: LikeParams,
    @Param() params: CommonParams,
  ) {
    return this.likeService.unlikeItem(
      req.user?._id,
      likeParams.type,
      params.id,
    );
  }

  @Get('likes/:id')
  async getLikes(
    @Body() likeParams: LikeParams,
    @Param() params: CommonParams,
  ) {
    return this.likeService.getLikes(params.id, likeParams.type);
  }
}
