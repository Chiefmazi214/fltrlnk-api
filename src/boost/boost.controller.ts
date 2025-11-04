import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { CreateBoostDto } from './dto/create-boost.dto';
import { UpdateBoostDto } from './dto/update-boost.dto';
import { CreateRevenueCatDto } from './dto/create-revenuecat.dto';
import { UpdateRevenueCatDto } from './dto/update-revenuecat.dto';

@ApiTags('boost')
@Controller('boost')
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  @Post()
  create(@Body() createBoostDto: CreateBoostDto) {
    return this.boostService.create(createBoostDto);
  }

  @Get()
  findAll() {
    return this.boostService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boostService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoostDto: UpdateBoostDto) {
    return this.boostService.update(+id, updateBoostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boostService.remove(+id);
  }

  // RevenueCat endpoints
  @Post('revenuecat')
  @ApiOperation({ summary: 'Create a new RevenueCat plan' })
  @ApiResponse({
    status: 201,
    description: 'RevenueCat plan created successfully',
  })
  createRevenueCat(@Body() createRevenueCatDto: CreateRevenueCatDto) {
    return this.boostService.createRevenueCat(createRevenueCatDto);
  }

  @Put('revenuecat/:revenuecatId')
  @ApiOperation({ summary: 'Update features array for a RevenueCat plan' })
  @ApiResponse({
    status: 200,
    description: 'Features updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'RevenueCat plan not found',
  })
  updateRevenueCatFeatures(
    @Param('revenuecatId') revenuecatId: string,
    @Body() updateRevenueCatDto: UpdateRevenueCatDto,
  ) {
    return this.boostService.updateRevenueCatFeatures(
      revenuecatId,
      updateRevenueCatDto,
    );
  }

  @Get('revenuecat')
  @ApiOperation({
    summary: 'Get all RevenueCat plans mapped with features array',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all RevenueCat plans with features',
  })
  getAllRevenueCatPlans() {
    return this.boostService.getAllRevenueCatPlansWithFeatures();
  }

  @Get('revenuecat/:revenuecatId')
  @ApiOperation({
    summary: 'Get a specific RevenueCat plan by revenuecatId',
  })
  @ApiResponse({
    status: 200,
    description: 'RevenueCat plan with features',
  })
  @ApiResponse({
    status: 404,
    description: 'RevenueCat plan not found',
  })
  getRevenueCatPlanById(@Param('revenuecatId') revenuecatId: string) {
    return this.boostService.getRevenueCatPlanByRevenuecatId(revenuecatId);
  }
}
