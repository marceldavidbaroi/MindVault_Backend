import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AccountLog } from '../entity/account-log.entity';

@Injectable()
export class AccountLogRepository extends Repository<AccountLog> {
  constructor(private readonly dataSource: DataSource) {
    super(AccountLog, dataSource.createEntityManager());
  }

  async createLog(log: Partial<AccountLog>) {
    const newLog = this.create(log);
    return this.save(newLog);
  }

  async findByAccountPaginated(
    accountId: number,
    page: number,
    limit: number,
    actions?: string[],
    order: 'asc' | 'desc' = 'desc',
  ) {
    const query = this.createQueryBuilder('log').where(
      'log.account_id = :accountId',
      { accountId },
    );

    // Filter by actions
    if (actions?.length) {
      query.andWhere('log.action IN (:...actions)', { actions });
    }

    // Only order by created_at
    query
      .orderBy('log.created_at', order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}
