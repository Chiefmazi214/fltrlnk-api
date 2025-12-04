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
import {
  CreateActiveBoostDto,
  RevenueCatWebhookPayload,
} from './dto/webhook.dto';
import { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { TransactionService } from './transaction.service';
import { CommonParams } from 'src/common/dtos/common.dtos';
import { GiveBoostsDto } from './dto/boosts.dto';
import { GetAllSubscriptionsDto } from './dto/subscription.dto';
import { GetAllTransactionsDto } from './dto/transaction.dto';

@ApiTags('boost')
@Controller('boost')
export class BoostController {
  constructor(
    private readonly boostService: BoostService,
    private readonly subscriptionService: SubscriptionService,
    private readonly transactionService: TransactionService,
  ) {}

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
    const event = webhookPayload.event;

    // Route to appropriate service based on event type
    const subscriptionEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'CANCELLATION',
      'EXPIRATION',
      'UNCANCELLATION',
      'SUBSCRIPTION_PAUSED',
    ];

    if (subscriptionEvents.includes(event.type)) {
      return this.subscriptionService.handleSubscriptionWebhook(event);
    } else {
      return this.boostService.handleWebhook(event);
    }
  }

  @Post('active')
  @UseGuards(AuthGuard)
  async createActiveBoost(
    @Body() createActiveBoostDto: CreateActiveBoostDto,
    @Req() req: Request,
  ) {
    await this.boostService.createActiveBoost(
      req.user?._id,
      createActiveBoostDto,
    );
    return {
      message: 'Active boost created successfully',
    };
  }

  @Get('subscriptions')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'Returns user subscriptions' })
  async getUserSubscriptions(@Req() req: Request) {
    return this.subscriptionService.getUserSubscriptions(req.user?._id);
  }

  @Get('subscriptions/active')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get active subscription' })
  @ApiResponse({ status: 200, description: 'Returns active subscription' })
  async getActiveSubscription(@Req() req: Request) {
    return this.subscriptionService.getActiveSubscription(req.user?._id);
  }

  @Post('give/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  async giveBoosts(@Param() params: CommonParams, @Body() body: GiveBoostsDto) {
    return this.boostService.giveBoosts(params.id, body);
  }

  @Get('subscriptions/all')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all subscriptions' })
  async getAllSubscriptions(@Query() query: GetAllSubscriptionsDto) {
    return this.boostService.getAllSubscriptions(query);
  }

  @Get('transactions/all')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all transactions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all transactions' })
  async getAllTransactions(@Query() query: GetAllTransactionsDto) {
    return this.transactionService.getAllTransactions(query);
  }

  @Get('transactions/stats')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get transaction statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns transaction stats' })
  async getTransactionStats() {
    return this.transactionService.getTransactionStats();
  }
}
