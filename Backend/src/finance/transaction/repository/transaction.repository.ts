// repository/transaction.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Transaction } from '../entity/transaction.entity';
import { QueryTransactionDto } from '../dto/query-transaction.dto';

@Injectable()
export class TransactionRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: number) {
    return this.dataSource.getRepository(Transaction).findOne({
      where: { id },
    });
  }

  async list(query: QueryTransactionDto) {
    const {
      page,
      limit,
      accountId,
      creatorId,
      categoryId,
      type,
      status,
      fromDate,
      toDate,
    } = query;

    const qb = this.dataSource
      .getRepository(Transaction)
      .createQueryBuilder('t');

    if (accountId) qb.andWhere('t.accountId = :accountId', { accountId });
    if (creatorId) qb.andWhere('t.creatorId = :creatorId', { creatorId });
    if (categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId });
    if (type) qb.andWhere('t.type = :type', { type });
    if (status) qb.andWhere('t.status = :status', { status });

    if (fromDate) qb.andWhere('t.transactionDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('t.transactionDate <= :toDate', { toDate });

    qb.orderBy('t.transactionDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }
}
