import { Injectable } from '@nestjs/common';
import {
  DashboardStatsDto,
  MonthlyActiveUsersDto,
  NewUsersDto,
  SubscribersDto,
  RevenueDto,
  SweepstakesProgressDto,
  StateEntryDto,
  SweepstakesProgressResponseDto,
  StateProgressDto,
} from './dtos/dashboard-stats.dto';

@Injectable()
export class AnalyticsService {
  getDashboardStats(): DashboardStatsDto {
    const monthlyActiveUsers: MonthlyActiveUsersDto = {
      total: 0,
      WAU: 0,
      DAU: 0,
    };

    const newUsers: NewUsersDto = {
      total: 0,
      individual: 0,
      business: 0,
    };

    const subscribers: SubscribersDto = {
      total: 0,
      basic: 0,
      pro: 0,
    };

    const revenue: RevenueDto = {
      total: 0.0,
      premium: 0.0,
      basic: 0.0,
      pro: 0.0,
    };

    const sweepstakesProgress: SweepstakesProgressDto = {
      current: 0,
      goal: 5000,
      percentage: '0%',
    };

    const topStatesBySweepstakes: StateEntryDto[] = [];

    return {
      monthlyActiveUsers,
      newUsers,
      subscribers,
      revenue,
      sweepstakesProgress,
      topStatesBySweepstakes,
    };
  }

  getSweepstakesProgress(): SweepstakesProgressResponseDto {
    // TODO: Mock data, to be replaced with real aggregation later
    const states: StateProgressDto[] = [
      { state: 'CA', entries: 12500, percentage: 62.5, goal: 10000 },
      { state: 'TX', entries: 8500, percentage: 85.0, goal: 5000 },
      { state: 'FL', entries: 3200, percentage: 64.0, goal: 1000 },
      { state: 'NY', entries: 2800, percentage: 56.0, goal: 1000 },
      { state: 'IL', entries: 1500, percentage: 30.0, goal: 1000 },
      { state: 'PA', entries: 1200, percentage: 24.0, goal: 1000 },
      { state: 'OH', entries: 950, percentage: 95.0, goal: 1000 },
      { state: 'GA', entries: 750, percentage: 75.0, goal: 1000 },
      { state: 'NC', entries: 600, percentage: 60.0, goal: 1000 },
      { state: 'MI', entries: 450, percentage: 45.0, goal: 1000 },
    ];

    return {
      title: 'Sweepstakes Progress by State',
      subtitle: 'State-level milestone tracking',
      states,
    };
  }

  getTopStatesBySweepstakes(): StateEntryDto[] {
    // TODO: Mock data, to be replaced with real aggregation later
    return [
      { state: 'CA', entries: 201 },
      { state: 'NY', entries: 173 },
      { state: 'TX', entries: 144 },
      { state: 'FL', entries: 109 },
      { state: 'IL', entries: 93 },
    ];
  }
}
