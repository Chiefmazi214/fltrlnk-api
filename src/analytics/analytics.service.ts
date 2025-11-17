import { Injectable } from '@nestjs/common';
import {
  DashboardStatsDto,
  MonthlyActiveUsersDto,
  NewUsersDto,
  SubscribersDto,
  RevenueDto,
  SweepstakesProgressDto,
  StateEntryDto,
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

  getSweepstakesProgress(): SweepstakesProgressDto {
    // TODO: Mock data, to be replaced with real aggregation later
    return {
      current: 0,
      goal: 5000,
      percentage: '0%',
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
