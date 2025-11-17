import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/user/models/role.model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard)
@Roles(RoleEnum.ADMIN)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Query() query: QueryAuditLogDto) {
    const result = await this.auditLogService.findAll(query);
    return {
      success: true,
      message: 'Audit logs retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const auditLog = await this.auditLogService.findOne(id);
    return {
      success: true,
      message: 'Audit log retrieved successfully',
      data: auditLog,
    };
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const auditLogs = await this.auditLogService.findByEntity(
      entityType as any,
      entityId,
    );
    return {
      success: true,
      message: 'Entity audit logs retrieved successfully',
      data: auditLogs,
    };
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    const auditLogs = await this.auditLogService.findByUser(userId, limit);
    return {
      success: true,
      message: 'User audit logs retrieved successfully',
      data: auditLogs,
    };
  }
}
