import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { UpdateRevenueCatDto } from './dto/update-revenuecat.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('boost')
@Controller('boost')
// @UseGuards(AuthGuard)  
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  @Put(':revenuecatId')
  updateRevenueCatFeatures(
    @Param('revenuecatId') revenuecatId: string,
    @Body() updateRevenueCatDto: UpdateRevenueCatDto,
  ) {
    return this.boostService.updateRevenueCatFeatures(
      revenuecatId,
      updateRevenueCatDto,
    );
  }

  @Get()
  getAllRevenueCatPlans() {
    return this.boostService.getAllRevenueCatPlansWithFeatures();
  }
}
