import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { IndividualService } from './individual.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateIndividualDto } from './dtos/create-individual.dto';
import { Request } from 'express';
import { UpdateIndividualDto } from './dtos/update-individual.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('individual')
export class IndividualController {
    constructor(private readonly individualService: IndividualService) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createIndividual(@Body() body: CreateIndividualDto, @Req() req: Request) {
        return this.individualService.createIndividual(req.user._id, body);
    }

    @Get('by-lifestyle-info')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async getIndividualsByLifestyleInfo(
        @Query() paginationDto: PaginationDto,
        @Req() req: Request,
        @Query('ids') lifestyleInfoIds?: string
    ) {
        const ids = lifestyleInfoIds ? lifestyleInfoIds.split(',') : undefined;
        return this.individualService.getIndividualsByLifestyleInfo(paginationDto, req.user._id, ids);
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getIndividual(@Req() req: Request) {
        return this.individualService.getIndividual(req.user._id);
    }

    @Get('all')
    async getIndividuals(@Query() paginationDto: PaginationDto) {
        return this.individualService.getIndividuals(paginationDto);
    }

    @Get(':id')
    async getIndividualById(@Param('id') id: string) {
        return this.individualService.getIndividualById(id);
    }

    @Put()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async updateIndividual(@Body() body: UpdateIndividualDto, @Req() req: Request) {
        return this.individualService.updateIndividual(req.user._id, body);
    }
}
