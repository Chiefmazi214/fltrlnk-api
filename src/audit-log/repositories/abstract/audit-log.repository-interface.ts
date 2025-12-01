import { BaseRepository } from 'src/common/repository/abstract/base.repository';
import { AuditLogDocument } from 'src/audit-log/models/audit-log.model';
import { QueryAuditLogDto } from 'src/audit-log/dto/query-audit-log.dto';

export interface AuditLogRepositoryInterface extends BaseRepository<AuditLogDocument> {
  findWithFilters(
    query: QueryAuditLogDto,
  ): Promise<{ data: AuditLogDocument[]; total: number; page: number; limit: number }>;

  deleteOldLogs(daysToKeep: number): Promise<number>;
}

export const AuditLogRepositoryInterface = Symbol('AuditLogRepositoryInterface');
