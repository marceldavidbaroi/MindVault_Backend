// repository/account-ledger.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountLedger } from '../entity/account-ledger.entity';
import { QueryLedgerDto } from '../dto/query-ledger.dto';

@Injectable()
export class AccountLedgerRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: number) {
    return this.dataSource
      .getRepository(AccountLedger)
      .findOne({ where: { id } });
  }

  async listByAccount(accountId: number, query: QueryLedgerDto) {
    const { page, limit, entryType, fromDate, toDate } = query;

    const qb = this.dataSource
      .getRepository(AccountLedger)
      .createQueryBuilder('l')
      .where('l.accountId = :accountId', { accountId });

    if (entryType) qb.andWhere('l.entryType = :entryType', { entryType });
    if (fromDate) qb.andWhere('l.createdAt >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('l.createdAt <= :toDate', { toDate });

    qb.orderBy('l.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async listByUser(userId: number, query: QueryLedgerDto) {
    const qb = this.dataSource
      .getRepository(AccountLedger)
      .createQueryBuilder('l')
      .where('l.creatorId = :userId', { userId });

    qb.orderBy('l.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }
}
