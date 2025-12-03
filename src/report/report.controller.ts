import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportUserInput } from './dto/report.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('report')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  reportUser(@Req() req: Request, @Body() input: ReportUserInput) {
    return this.reportService.reportUser(req.user?._id, input);
  }
}
