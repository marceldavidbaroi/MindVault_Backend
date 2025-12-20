import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionAuditLog } from '../entity/transaction-audit-log.entity.ts';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';

@Injectable()
export class TransactionAuditLogRepository extends Repository<TransactionAuditLog> {
  constructor(private dataSource: DataSource) {
    super(TransactionAuditLog, dataSource.createEntityManager());
  }

  /**
   * listLogsByTransaction
   * Focused strictly on the Transaction ID.
   */
  async listLogsByTransaction(transactionId: number, filter: QueryAuditLogDto) {
    const { page = 1, limit = 20 } = filter;

    const [data, total] = await this.findAndCount({
      where: { transactionId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total, page, limit };
  }

  /**
   * listLogsByAccount
   * Broad audit for an entire account with optional filters.
   */
  async listLogsByAccount(accountId: number, filter: QueryAuditLogDto) {
    const {
      page = 1,
      limit = 20,
      actorId,
      action,
      startDate,
      endDate,
    } = filter;

    const qb = this.createQueryBuilder('log');

    // Primary Filter (Logic assumes your log stores account context or links through transaction)
    // Note: If accountId isn't in log entity, we join transactions table
    qb.innerJoin('transactions', 't', 't.id = log.transaction_id');
    qb.where('t.account_id = :accountId', { accountId });

    if (actorId) qb.andWhere('log.actor_id = :actorId', { actorId });
    if (action) qb.andWhere('log.action = :action', { action });

    if (startDate && endDate) {
      qb.andWhere('log.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const [data, total] = await qb
      .orderBy('log.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
