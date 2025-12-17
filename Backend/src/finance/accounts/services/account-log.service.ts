import { Injectable } from '@nestjs/common';
import { AccountLogRepository } from '../repository/account-log.repository';
import { AccountLogValidator } from '../validators/account-log.validator';
import { AccountLogTransformer } from '../transformers/account-log.transformer';
import { AccountLog } from '../entity/account-log.entity';

// need to add the role validation

@Injectable()
export class AccountLogService {
  constructor(
    private readonly repository: AccountLogRepository,
    private readonly validator: AccountLogValidator,
  ) {}

  async create(log: Partial<AccountLog>) {
    const saved = await this.repository.createLog(log);
    return {
      success: true,
      message: 'Account log created',
      data: AccountLogTransformer.toResponse(saved),
    };
  }

  async listByAccount(
    accountId: number,
    page: number = 1,
    limit: number = 20,
    actions?: string[],
    order: 'asc' | 'desc' = 'desc',
    relations: string[] = [],
  ) {
    const actionsArray = actions?.length
      ? actions.map((a) => a.trim())
      : undefined;
    const relArray = relations?.length ? relations : [];

    const { data, total } = await this.repository.findByAccountPaginated(
      accountId,
      page,
      limit,
      actionsArray,
      order,
      relArray,
    );

    return {
      success: true,
      message: 'Account logs fetched',
      data: AccountLogTransformer.toResponseList(data),
      meta: { page, limit, total },
    };
  }

  async get(id: number, relations: string[] = []) {
    const log = await this.validator.ensureExists(id);
    if (relations.length)
      await this.repository.findOne({ where: { id }, relations });
    return {
      success: true,
      message: 'Account log fetched',
      data: AccountLogTransformer.toResponse(log),
    };
  }
}
