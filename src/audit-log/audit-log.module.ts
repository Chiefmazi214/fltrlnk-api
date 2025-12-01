import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AuditLog, AuditLogSchema } from './models/audit-log.model';
import { AuditLogRepository } from './repositories/mongoose/audit-log.repository.mongoose';
import { AuditLogRepositoryInterface } from './repositories/abstract/audit-log.repository-interface';

@Global() // Make this module global so it can be used anywhere without importing
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    {
      provide: AuditLogRepositoryInterface,
      useClass: AuditLogRepository,
    },
  ],
  exports: [AuditLogService], // Export the service so other modules can use it
})
export class AuditLogModule {}
