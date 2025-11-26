import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  ChangeUserStatusInput,
  GetUsersWithPaginationQueryInput,
  UpdateReferralUsernameDto,
  UpdateUserDto,
} from './dtos/user.dto';
import { UpdateLifestyleInfoDto } from './dtos/update-lifestyle-info.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from './models/role.model';
import { CommonParams } from 'src/common/dtos/common.dtos';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getAllUsers(@Query() query: GetUsersWithPaginationQueryInput) {
    return this.userService.getUsersWithPagination(query);
  }

  @Get('admin')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  async getUsersWithPagination(
    @Query() query: GetUsersWithPaginationQueryInput,
  ) {
    return this.userService.getUsersWithPagination(query);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  async deleteUserById(@Param() params: CommonParams) {
    return this.userService.deleteUserById(params.id);
  }

  @Put('status/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  async updateUserStatusById(
    @Param() params: CommonParams,
    @Body() input: ChangeUserStatusInput,
  ) {
    return this.userService.updateUserStatusById(params.id, input);
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateUser(@Body() user: UpdateUserDto, @Req() req: Request) {
    return this.userService.updateUserProfile(req.user._id, user);
  }

  @Put('update/referral-username')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateReferralUsername(
    @Body() input: UpdateReferralUsernameDto,
    @Req() req: Request,
  ) {
    return this.userService.updateReferralUsername(req.user?._id, input);
  }

  @Put('update/profile-image')
  @UseInterceptors(FileInterceptor('attachment'))
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateUserProfileImage(
    @UploadedFile() attachment: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.updateUserProfileImage(req.user._id, attachment);
  }

  @Put('lifestyle-info')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user lifestyle information',
    description:
      'Updates the lifestyle information of the authenticated user. Requires authentication token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lifestyle information updated successfully',
    schema: {
      example: {
        _id: '64f123456789abcdef123456',
        lifestyleInfo: [
          {
            _id: '64f123456789abcdef123457',
            name: 'Gaming',
            icon: '🎮',
            category: 'GAMES',
          },
          {
            _id: '64f123456789abcdef123458',
            name: 'Music',
            icon: '🎵',
            category: 'MUSIC',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid lifestyle info IDs',
  })
  async updateUserLifestyleInfo(
    @Body() updateDto: UpdateLifestyleInfoDto,
    @Req() req: Request,
  ) {
    return this.userService.updateUserLifestyleInfo(
      req.user._id,
      updateDto.lifestyleInfoIds,
    );
  }

  @Get('lifestyle-info')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user lifestyle information',
    description:
      'Retrieves the lifestyle information of the authenticated user. Requires authentication token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user lifestyle information',
    schema: {
      example: {
        _id: '64f123456789abcdef123456',
        lifestyleInfo: [
          {
            _id: '64f123456789abcdef123457',
            name: 'Gaming',
            icon: '🎮',
            category: 'GAMES',
          },
          {
            _id: '64f123456789abcdef123458',
            name: 'Music',
            icon: '🎵',
            category: 'MUSIC',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  async getUserLifestyleInfo(
    @Req() req: Request,
    @Query('userId') userId: string,
  ) {
    return this.userService.getUserLifestyleInfo(userId);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    return this.userService.getMe(req.user._id);
  }

  @Get(`/:id`)
  async getUserById(@Param() params: CommonParams) {
    return this.userService.getUserById(params.id);
  }

  @Get('check-username/:username')
  @ApiOperation({
    summary: 'Check if username is taken',
    description: 'Checks if a given username is already taken by another user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the username is taken',
    schema: {
      example: {
        isTaken: true,
      },
    },
  })
  async isUsernameTaken(@Param('username') username: string) {
    const isTaken = await this.userService.isUsernameTaken(username);
    return { isTaken };
  }
}
