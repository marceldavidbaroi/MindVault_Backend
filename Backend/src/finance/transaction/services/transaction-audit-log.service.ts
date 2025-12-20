import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/types/api-response.type';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { TransactionAuditLogRepository } from '../repository/transaction-audit-log.repository';
import { TransactionAuditLogTransformer } from '../transformers/transaction-audit-log.transformer';
import { TransactionAuditLog } from '../entity/transaction-audit-log.entity.ts';
import { EntityManager } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { CreateTransactionAuditLogDto } from '../dto/create-audit-log.dto';

@Injectable()
export class TransactionAuditLogService {
  constructor(
    private readonly repository: TransactionAuditLogRepository,
    private readonly transformer: TransactionAuditLogTransformer,
  ) {}

  async create(manager: EntityManager, dto: CreateTransactionAuditLogDto) {
    const repo = manager.getRepository(TransactionAuditLog);

    const saved = await repo.save(repo.create(dto));

    return saved;
  }

  async getByTransaction(
    transactionId: number,
    query: QueryAuditLogDto,
  ): Promise<ApiResponse<any>> {
    const { data, total, page, limit } =
      await this.repository.listLogsByTransaction(transactionId, query);

    return {
      success: true,
      message: 'Transaction logs retrieved.',
      data: this.transformer.transformMany(data),
      meta: { page, limit, total },
    };
  }

  async getByAccount(
    accountId: number,
    query: QueryAuditLogDto,
  ): Promise<ApiResponse<any>> {
    const { data, total, page, limit } =
      await this.repository.listLogsByAccount(accountId, query);

    return {
      success: true,
      message: 'Account audit logs retrieved.',
      data: this.transformer.transformMany(data),
      meta: { page, limit, total },
    };
  }
}
