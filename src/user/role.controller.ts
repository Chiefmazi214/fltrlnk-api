import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from './models/role.model';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get(':id')
    @ApiBearerAuth()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Get role by ID' })
    @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async getRoleById(@Param('id') id: string) {
        return this.roleService.getRoleById(id);
    }

    @Get('name/:name')
    @ApiBearerAuth()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Get role by name' })
    @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async getRoleByName(@Param('name') name: string) {
        return this.roleService.getRoleByName(name);
    }

    @Post()
    @ApiBearerAuth()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createRole(@Body() roleData: { name: RoleEnum }) {
        return this.roleService.createRole(roleData);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Update a role' })
    @ApiResponse({ status: 200, description: 'Role updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async updateRole(@Param('id') id: string, @Body() roleData: { name: RoleEnum }) {
        return this.roleService.updateRole(id, roleData);
    }
}
