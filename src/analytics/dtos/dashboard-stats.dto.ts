import { ApiProperty } from '@nestjs/swagger';

export class MonthlyActiveUsersDto {
  @ApiProperty({ example: 0 })
  total: number;

  @ApiProperty({ example: 0 })
  WAU: number;

  @ApiProperty({ example: 0 })
  DAU: number;
}

export class NewUsersDto {
  @ApiProperty({ example: 0 })
  total: number;

  @ApiProperty({ example: 0 })
  individual: number;

  @ApiProperty({ example: 0 })
  business: number;
}

export class SubscribersDto {
  @ApiProperty({ example: 0 })
  total: number;

  @ApiProperty({ example: 0 })
  basic: number;

  @ApiProperty({ example: 0 })
  pro: number;
}

export class RevenueDto {
  @ApiProperty({ example: 0.0 })
  total: number;

  @ApiProperty({ example: 0.0 })
  premium: number;

  @ApiProperty({ example: 0.0 })
  basic: number;

  @ApiProperty({ example: 0.0 })
  pro: number;
}

export class SweepstakesProgressDto {
  @ApiProperty({ example: 0 })
  current: number;

  @ApiProperty({ example: 5000 })
  goal: number;

  @ApiProperty({ example: '0%' })
  percentage: string;
}

export class StateEntryDto {
  @ApiProperty({ example: 'California' })
  state: string;

  @ApiProperty({ example: 0 })
  entries: number;
}

export class StateProgressDto {
  @ApiProperty({ example: 'CA', description: 'State abbreviation' })
  state: string;

  @ApiProperty({ example: 12500, description: 'Number of entries for this state' })
  entries: number;

  @ApiProperty({ example: 62.5, description: 'Percentage progress (0-100)' })
  percentage: number;

  @ApiProperty({ example: 10000, description: 'Goal/milestone for this state' })
  goal: number;
}

export class SweepstakesProgressResponseDto {
  @ApiProperty({ example: 'Sweepstakes Progress by State' })
  title: string;

  @ApiProperty({ example: 'State-level milestone tracking' })
  subtitle: string;

  @ApiProperty({ type: [StateProgressDto] })
  states: StateProgressDto[];
}

export class DashboardStatsDto {
  @ApiProperty({ type: MonthlyActiveUsersDto })
  monthlyActiveUsers: MonthlyActiveUsersDto;

  @ApiProperty({ type: NewUsersDto })
  newUsers: NewUsersDto;

  @ApiProperty({ type: SubscribersDto })
  subscribers: SubscribersDto;

  @ApiProperty({ type: RevenueDto })
  revenue: RevenueDto;

  @ApiProperty({ type: SweepstakesProgressDto })
  sweepstakesProgress: SweepstakesProgressDto;

  @ApiProperty({ type: [StateEntryDto] })
  topStatesBySweepstakes: StateEntryDto[];
}
