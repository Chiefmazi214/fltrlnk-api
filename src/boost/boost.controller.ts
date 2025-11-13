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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { UpdateRevenueCatInput } from './dto/revenuecat.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';
import { RevenueCatWebhookPayload } from './dto/webhook.dto';

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
  async handleRevenueCatWebhook(@Body() webhookPayload: RevenueCatWebhookPayload) {
    return this.boostService.handleWebhook(webhookPayload.event);
  }

  // Active Boost endpoints
  @Get('active/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get active boosts for a user' })
  async getUserActiveBoosts(@Param('userId') userId: string) {
    return this.boostService.getUserActiveBoosts(userId);
  }

  @Get('active')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all active boosts (Admin only)' })
  async getAllActiveBoosts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.boostService.getAllActiveBoosts(page, limit);
  }

  @Get('active/subscription/:subscriptionId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get active boost by subscription ID' })
  async getActiveBoostBySubscriptionId(
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.boostService.getActiveBoostBySubscriptionId(subscriptionId);
  }

  @Delete('active/:activeBoostId')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete active boost (Admin only)' })
  async deleteActiveBoost(@Param('activeBoostId') activeBoostId: string) {
    return this.boostService.deleteActiveBoost(activeBoostId);
  }
}
