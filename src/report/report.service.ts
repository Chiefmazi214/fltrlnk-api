import { Injectable } from '@nestjs/common';
import { ReportUserInput } from './dto/report.dto';
import { Model } from 'mongoose';
import { ReportDocument, Report } from './entities/report.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
  ) {}

  async reportUser(reportedUserId: string, input: ReportUserInput) {
    const { userId, message } = input;
    const report = await this.reportModel.create({
      reporter: reportedUserId,
      reportedUser: userId,
      message,
    });

    return report;
  }
}
