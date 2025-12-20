import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { TransactionAuditLogService } from '../services/transaction-audit-log.service';

@Controller('audit-logs')
export class TransactionAuditLogController {
  constructor(private readonly service: TransactionAuditLogService) {}

  @Get('transaction/:id')
  async listByTransaction(
    @Param('id') id: number,
    @Query() query: QueryAuditLogDto,
  ) {
    return this.service.getByTransaction(id, query);
  }

  @Get('account/:id')
  async listByAccount(
    @Param('id') id: number,
    @Query() query: QueryAuditLogDto,
  ) {
    return this.service.getByAccount(id, query);
  }
}
