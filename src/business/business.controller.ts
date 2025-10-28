import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateBusinessDto } from './dtos/create-business.dto';
import { Request } from 'express';
import { UpdateBusinessDto } from './dtos/update-business.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createBusiness(@Body() body: CreateBusinessDto, @Req() req: Request) {
    return this.businessService.createBusiness(req.user._id, body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getBusiness(@Req() req: Request) {
    return this.businessService.getBusiness(req.user._id);
  }

  @Get('all')
  async getBusinesses(@Query() paginationDto: PaginationDto) {
    return this.businessService.getBusinesses(paginationDto);
  }

  @Get(':id')
  async getBusinessById(@Param('id') id: string) {
    return this.businessService.getBusinessById(id);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateBusiness(@Body() body: UpdateBusinessDto, @Req() req: Request) {
    return this.businessService.updateBusiness(req.user._id, body);
  }
}
