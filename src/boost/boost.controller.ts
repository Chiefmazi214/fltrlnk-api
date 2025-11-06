import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { UpdateRevenueCatInput } from './dto/revenuecat.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';

@ApiTags('boost')
@Controller('boost')
@UseGuards(AuthGuard)
@Roles(RoleEnum.ADMIN)
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  @Put(':revenuecatId')
  updateRevenueCatFeatures(
    @Param('revenuecatId') revenuecatId: string,
    @Body() updateRevenueCatDto: UpdateRevenueCatInput,
  ) {
    return this.boostService.updateRevenueCatFeatures(
      revenuecatId,
      updateRevenueCatDto,
    );
  }

  @Get()
  getAllRevenueCatPlans() {
    return this.boostService.getAllPlans();
  }

  @Delete(':revenuecatId')
  async deleteRevenueCat(@Param('revenuecatId') revenuecatId: string) {
    return this.boostService.deleteRevenueCat(revenuecatId);
  }

  @Get(':revenuecatId')
  getRevenueCatById(@Param('revenuecatId') revenuecatId: string) {
    return this.boostService.getRevenueCatById(revenuecatId);
  }
}
