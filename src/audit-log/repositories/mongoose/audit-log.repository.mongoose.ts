import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseRepositoryBase } from 'src/common/repository/mongoose/mongoose.repository';
import { AuditLog, AuditLogDocument } from 'src/audit-log/models/audit-log.model';
import { AuditLogRepositoryInterface } from '../abstract/audit-log.repository-interface';
import { QueryAuditLogDto } from 'src/audit-log/dto/query-audit-log.dto';

@Injectable()
export class AuditLogRepository
  extends MongooseRepositoryBase<AuditLogDocument>
  implements AuditLogRepositoryInterface
{
  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {
    super(auditLogModel);
  }

  async findWithFilters(
    query: QueryAuditLogDto,
  ): Promise<{ data: AuditLogDocument[]; total: number; page: number; limit: number }> {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
    } = query;

    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (action) {
      filter.action = action;
    }

    if (entityType) {
      filter.entityType = entityType;
    }

    if (entityId) {
      filter.entityId = entityId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email firstName lastName')
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async deleteOldLogs(daysToKeep: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}
