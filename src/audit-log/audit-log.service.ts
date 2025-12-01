import { Injectable, Inject } from '@nestjs/common';
import { AuditLogRepositoryInterface } from './repositories/abstract/audit-log.repository-interface';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLogDocument } from './models/audit-log.model';
import { AuditAction, EntityType } from './audit-log.enum';

@Injectable()
export class AuditLogService {
  constructor(
    @Inject(AuditLogRepositoryInterface)
    private readonly auditLogRepository: AuditLogRepositoryInterface,
  ) {}  

  async log(
    action: AuditAction,
    entityType: EntityType,
    options?: {
      userId?: string;
      entityId?: string;
      entityName?: string;
      description?: string;
      metadata?: any;
      oldValue?: any;
      newValue?: any;
      changes?: any;
    },
  ): Promise<AuditLogDocument> {
    return this.auditLogRepository.create({
      action,
      entityType,
      userId: options?.userId,
      entityId: options?.entityId,
      entityName: options?.entityName,
      description: options?.description,
      metadata: options?.metadata,
      oldValue: options?.oldValue,
      newValue: options?.newValue,
      changes: options?.changes,
    });
  }

  async findAll(
    query: QueryAuditLogDto,
  ): Promise<{ data: AuditLogDocument[]; total: number; page: number; limit: number }> {
    return this.auditLogRepository.findWithFilters(query);
  }

  async findOne(id: string): Promise<AuditLogDocument | null> {
    return this.auditLogRepository.findById(id, [
      { path: 'userId', select: 'username email firstName lastName' },
    ]);
  }

  async findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogRepository.findAll(
      { entityType, entityId },
      [{ path: 'userId', select: 'username email firstName lastName' }],
      { skip: 0, limit: 100 },
    );
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLogDocument[]> {
    return this.auditLogRepository.findAll(
      { userId },
      [],
      { skip: 0, limit },
    );
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    return this.auditLogRepository.deleteOldLogs(daysToKeep);
  }
}
