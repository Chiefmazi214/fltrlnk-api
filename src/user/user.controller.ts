import { Body, Controller, Get, Param, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateLifestyleInfoDto } from './dtos/update-lifestyle-info.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get()
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Put("update")
    @UseGuards(AuthGuard)
    async updateUser(@Body() user: UpdateUserDto, @Req() req: Request) {
        return this.userService.updateUserProfile(req.user._id, user);
    }

    @Put("update/profile-image")
    @UseInterceptors(FileInterceptor('attachment'))
    @UseGuards(AuthGuard)
    async updateUserProfileImage(@UploadedFile() attachment: Express.Multer.File, @Req() req: Request) {
        return this.userService.updateUserProfileImage(req.user._id, attachment);
    }

    @Put('lifestyle-info')
    @UseGuards(AuthGuard)
    @ApiOperation({ 
        summary: 'Update user lifestyle information',
        description: 'Updates the lifestyle information of the authenticated user. Requires authentication token.'
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
                        category: 'GAMES'
                    },
                    {
                        _id: '64f123456789abcdef123458',
                        name: 'Music',
                        icon: '🎵',
                        category: 'MUSIC'
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid lifestyle info IDs' })
    async updateUserLifestyleInfo(
        @Body() updateDto: UpdateLifestyleInfoDto,
        @Req() req: Request
    ) {
        return this.userService.updateUserLifestyleInfo(req.user._id, updateDto.lifestyleInfoIds);
    }

    @Get('lifestyle-info')
    @UseGuards(AuthGuard)
    @ApiOperation({ 
        summary: 'Get user lifestyle information',
        description: 'Retrieves the lifestyle information of the authenticated user. Requires authentication token.'
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
                        category: 'GAMES'
                    },
                    {
                        _id: '64f123456789abcdef123458',
                        name: 'Music',
                        icon: '🎵',
                        category: 'MUSIC'
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
    async getUserLifestyleInfo(@Req() req: Request, @Query('userId') userId: string) {
        return this.userService.getUserLifestyleInfo(userId);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    async getMe(@Req() req: Request) {
        return this.userService.getMe(req.user._id);
    }

    @Get(`/:id`)
    async getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Get('check-username/:username')
    @ApiOperation({ 
        summary: 'Check if username is taken',
        description: 'Checks if a given username is already taken by another user'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns whether the username is taken',
        schema: {
            example: {
                isTaken: true
            }
        }
    })
    async isUsernameTaken(@Param('username') username: string) {
        const isTaken = await this.userService.isUsernameTaken(username);
        return { isTaken };
    }
}
