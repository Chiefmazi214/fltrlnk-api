import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

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

export class SweepstakesProgressDto {
  @ApiProperty({
    description: 'Current total Pro users (subscribers)',
    example: 2500,
  })
  @IsNumber()
  current: number;

  @ApiProperty({ description: 'Goal for Pro subscribers', example: 5000 })
  @IsNumber()
  goal: number;

  @ApiProperty({ description: 'Percentage of goal reached', example: '50%' })
  @IsString()
  percentage: string;

  @ApiProperty({
    description: 'Whether the goal was reached before deadline',
    example: false,
  })
  @IsBoolean()
  isActivated: boolean;
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
  basic: number;

  @ApiProperty({ example: 0.0 })
  pro: number;

  @ApiProperty({ example: 0.0 })
  boost: number;
}

export class StateEntryDto {
  @ApiProperty({ example: 'California' })
  state: string;

  @ApiProperty({ example: 0 })
  count: number;
}

export class StateProgressDto {
  @ApiProperty({ example: 'CA', description: 'State abbreviation' })
  state: string;

  @ApiProperty({
    example: 12500,
    description: 'Number of entries for this state',
  })
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

export class UserMatrixDto {
  @ApiProperty({ example: 0 })
  totalUsers: number;

  @ApiProperty({ example: 0 })
  paidUsers: number;

  @ApiProperty({ example: 0 })
  totalBusinesses: number;
}

export class RevenueMatrixDto {
  @ApiProperty({ example: 0.0 })
  totalRevenue: number;

  @ApiProperty({ example: 0.0 })
  averageOrderValue: number;

  @ApiProperty({ example: 0 })
  totalTransactions: number;
}

export class TopInviterDto {
  @ApiProperty({ description: 'Inviter username', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Number of invited Pro subscribers (qualified)',
    example: 25,
  })
  @IsNumber()
  invitedCount: number;
}

export class SweepstakesDashboardDto {
  @ApiProperty({
    description: 'Sweepstakes progress information',
    type: SweepstakesProgressDto,
  })
  @ValidateNested()
  @Type(() => SweepstakesProgressDto)
  progress: SweepstakesProgressDto;

  @ApiProperty({
    description: 'Top states by Pro subscribers',
    type: [StateEntryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StateEntryDto)
  topStates: StateEntryDto[];

  @ApiProperty({
    description: 'Top inviters by qualified invites',
    type: [TopInviterDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopInviterDto)
  topInviters: TopInviterDto[];
}
