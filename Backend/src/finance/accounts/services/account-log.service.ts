import { Injectable } from '@nestjs/common';
import { AccountLogRepository } from '../repository/account-log.repository';
import { AccountLogValidator } from '../validators/account-log.validator';
import { AccountLogTransformer } from '../transformers/account-log.transformer';
import { AccountLog } from '../entity/account-log.entity';
import { EntityManager } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Account } from '../entity/account.entity';

@Injectable()
export class AccountLogService {
  constructor(
    private readonly repository: AccountLogRepository,
    private readonly validator: AccountLogValidator,
  ) {}

  /**
   * Create a log entry
   * Automatically stores userSnapshot and accountSnapshot if provided
   */
  async create(
    manager: EntityManager,
    log: Partial<AccountLog> & { user?: User; account?: Account },
  ) {
    const repo = manager.getRepository(AccountLog);

    // Add snapshots
    if (log.user) {
      log.userSnapshot = {
        id: log.user.id,
        name: log.user.username,
        email: log.user.email,
      };
      log.userId = log.user.id;
    }

    if (log.account) {
      log.accountSnapshot = {
        id: log.account.id,
        accountNumber: log.account.accountNumber,
        ownerId: log.account.ownerId,
        typeId: log.account.typeId,
        currencyCode: log.account.currencyCode,
        balance: log.account.balance,
      };
      log.accountId = log.account.id;
    }

    const saved = await repo.save(repo.create(log));

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

    if (relations.length) {
      await this.repository.findOne({ where: { id }, relations });
    }

    return {
      success: true,
      message: 'Account log fetched',
      data: AccountLogTransformer.toResponse(log),
    };
  }
}
