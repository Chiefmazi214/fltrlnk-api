import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { UpdateRevenueCatInput } from './dto/revenuecat.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';
import { CreateActiveBoostDto, RevenueCatWebhookPayload } from './dto/webhook.dto';
import { Request } from 'express';

@ApiTags('boost')
@Controller('boost')
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  @Put(':revenuecatId')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  updateRevenueCatFeatures(
    @Param('revenuecatId') revenuecatId: string,
    @Body() updateRevenueCatDto: UpdateRevenueCatInput,
  ) {
    return this.boostService.updateRevenueCatFeatures(
      revenuecatId,
      updateRevenueCatDto,
    );
  }

  @Get('')
  @UseGuards(AuthGuard)
  getUserBoosts(@Req() req: Request) {
    return this.boostService.getUserBoosts(req.user?._id);
  }

  @Get('plans')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  getAllRevenueCatPlans() {
    return this.boostService.getAllPlans();
  }

  @Delete(':revenuecatId')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  async deleteRevenueCat(@Param('revenuecatId') revenuecatId: string) {
    return this.boostService.deleteRevenueCat(revenuecatId);
  }

  @Get(':revenuecatId')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  getRevenueCatById(@Param('revenuecatId') revenuecatId: string) {
    return this.boostService.getRevenueCatById(revenuecatId);
  }

  // RevenueCat Webhook endpoint (no auth required for webhooks)
  @Post('webhook')
  @ApiOperation({ summary: 'RevenueCat webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleRevenueCatWebhook(
    @Body() webhookPayload: RevenueCatWebhookPayload,
  ) {
    return this.boostService.handleWebhook(webhookPayload.event);
  }

  @Post('active')
  @UseGuards(AuthGuard)
  async createActiveBoost(@Body() createActiveBoostDto: CreateActiveBoostDto, @Req() req: Request) {
    await this.boostService.createActiveBoost(req.user?._id, createActiveBoostDto);
    return {
      message: 'Active boost created successfully',
    };
  }
}
