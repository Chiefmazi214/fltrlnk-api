import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LifestyleInfoService } from './lifestyle-info.service';
import { LifestyleInfo, LifestyleCategory } from './models/lifestyle-info.model';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Lifestyle Information')
@Controller('lifestyle-info')
export class LifestyleInfoController {
    constructor(private readonly lifestyleInfoService: LifestyleInfoService) {}

    @Get()
    async getAllLifestyleInfo() {
        return this.lifestyleInfoService.getAllLifestyleInfo();
    }

    // @Post()
    // @ApiOperation({ 
    //     summary: 'Create a new lifestyle info',
    //     description: 'Creates a new lifestyle information entry with the provided details.'
    // })
    // @ApiResponse({ 
    //     status: 201, 
    //     description: 'Lifestyle info created successfully',
    //     schema: {
    //         example: {
    //             _id: '64f123456789abcdef123456',
    //             name: 'Gaming',
    //             icon: '🎮',
    //             category: 'GAMES'
    //         }
    //     }
    // })
    // @ApiResponse({ status: 400, description: 'Bad Request - Invalid lifestyle info data' })
    // async createLifestyleInfo(@Body() info: Partial<LifestyleInfo>) {
    //     return this.lifestyleInfoService.createLifestyleInfo(info);
    // }

    @Get("category/:category")
    @ApiOperation({ 
        summary: 'Get all lifestyle info or filter by category',
        description: 'Retrieves all lifestyle information entries or filters them by category if specified.'
    })
    @ApiQuery({ 
        name: 'category', 
        enum: LifestyleCategory, 
        required: false,
        description: 'Optional category filter to get lifestyle info of a specific category'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns list of lifestyle information',
        schema: {
            example: [{
                _id: '64f123456789abcdef123456',
                name: 'Gaming',
                icon: '🎮',
                category: 'GAMES'
            }, {
                _id: '64f123456789abcdef123457',
                name: 'Music',
                icon: '🎵',
                category: 'MUSIC'
            }]
        }
    })
    async getLifestyleInfo(@Param('category') category?: LifestyleCategory) {
        if (category) {
            return this.lifestyleInfoService.getLifestyleInfoByCategory(category);
        }
        return this.lifestyleInfoService.getAllLifestyleInfo();
    }

    // @Put(':id')
    // @ApiOperation({ 
    //     summary: 'Update a lifestyle info',
    //     description: 'Updates an existing lifestyle information entry by its ID.'
    // })
    // @ApiParam({ 
    //     name: 'id', 
    //     type: String,
    //     description: 'ID of the lifestyle info to update',
    //     example: '64f123456789abcdef123456'
    // })
    // @ApiResponse({ 
    //     status: 200, 
    //     description: 'Lifestyle info updated successfully',
    //     schema: {
    //         example: {
    //             _id: '64f123456789abcdef123456',
    //             name: 'Gaming',
    //             icon: '🎮',
    //             category: 'GAMES'
    //         }
    //     }
    // })
    // @ApiResponse({ status: 404, description: 'Not Found - Lifestyle info not found' })
    // @ApiResponse({ status: 400, description: 'Bad Request - Invalid update data' })
    // async updateLifestyleInfo(
    //     @Param('id') id: string,
    //     @Body() info: Partial<LifestyleInfo>
    // ) {
    //     return this.lifestyleInfoService.updateLifestyleInfo(id, info);
    // }

    // @Delete(':id')
    // @ApiOperation({ 
    //     summary: 'Delete a lifestyle info',
    //     description: 'Deletes an existing lifestyle information entry by its ID.'
    // })
    // @ApiParam({ 
    //     name: 'id', 
    //     type: String,
    //     description: 'ID of the lifestyle info to delete',
    //     example: '64f123456789abcdef123456'
    // })
    // @ApiResponse({ status: 200, description: 'Lifestyle info deleted successfully' })
    // @ApiResponse({ status: 404, description: 'Not Found - Lifestyle info not found' })
    // async deleteLifestyleInfo(@Param('id') id: string) {
    //     return this.lifestyleInfoService.deleteLifestyleInfo(id);
    // }

    // @Post('seed')
    // @ApiOperation({ 
    //     summary: 'Seed default lifestyle info',
    //     description: 'Creates default lifestyle information entries in the database.'
    // })
    // @ApiResponse({ 
    //     status: 201, 
    //     description: 'Default lifestyle info seeded successfully',
    //     schema: {
    //         example: {
    //             message: 'Default lifestyle info seeded successfully'
    //         }
    //     }
    // })
    // async seedLifestyleInfo() {
    //     await this.lifestyleInfoService.seedDefaultLifestyleInfo();
    //     return { message: 'Default lifestyle info seeded successfully' };
    // }
} 