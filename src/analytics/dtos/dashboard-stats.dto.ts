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
