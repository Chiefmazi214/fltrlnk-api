import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  DashboardStatsDto,
  StateEntryDto,
  SweepstakesProgressResponseDto,
  UserMatrixDto,
  RevenueMatrixDto,
} from './dtos/dashboard-stats.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

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
  getDashboardStats(): Promise<DashboardStatsDto> {
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

  @Get('user-matrix')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user matrix statistics' })
  @ApiResponse({
    status: 200,
    description: 'User matrix statistics retrieved successfully',
    type: UserMatrixDto,
  })
  getUserMatrix(): Promise<UserMatrixDto> {
    return this.analyticsService.getUserMatrix();
  }

  @Get('revenue-matrix')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue matrix statistics' })
  @ApiResponse({
    status: 200,
    description: 'Revenue matrix statistics retrieved successfully',
    type: RevenueMatrixDto,
  })
  getRevenueMatrix(): Promise<RevenueMatrixDto> {
    return this.analyticsService.getRevenueMatrix();
  }

  @Get('user-graphs')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user-related graph data' })
  @ApiResponse({
    status: 200,
    description: 'User graph data retrieved successfully',
  })
  getUserGraphData() {
    return this.analyticsService.getUserGraphData();
  }

  @Get('revenue-graphs')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue-related graph data' })
  @ApiResponse({
    status: 200,
    description: 'Revenue graph data retrieved successfully',
  })
  getRevenueGraphData() {
    return this.analyticsService.getRevenueGraphData();
  }
}