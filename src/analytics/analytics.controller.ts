import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  DashboardStatsDto,
  StateEntryDto,
  SweepstakesProgressResponseDto,
} from './dtos/dashboard-stats.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  getDashboardStats(): DashboardStatsDto {
    return this.analyticsService.getDashboardStats();
  }

  @Get('sweepstakes-progress')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sweepstakes progress by state' })
  @ApiResponse({
    status: 200,
    description: 'Sweepstakes progress by state retrieved successfully',
    type: SweepstakesProgressResponseDto,
  })
  getSweepstakesProgress(): SweepstakesProgressResponseDto {
    return this.analyticsService.getSweepstakesProgress();
  }

  @Get('top-states-sweepstakes')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top states by sweepstakes entries' })
  @ApiResponse({
    status: 200,
    description: 'Top states by sweepstakes entries retrieved successfully',
    type: [StateEntryDto],
  })
  getTopStatesBySweepstakes(): StateEntryDto[] {
    return this.analyticsService.getTopStatesBySweepstakes();
  }
}
