import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountUserRole } from '../entity/account-user-role.entity';

@Injectable() // Change to Injectable
export class AccountUserRoleRepository {
  constructor(
    @InjectRepository(AccountUserRole)
    private readonly repo: Repository<AccountUserRole>,
  ) {}

  // Expose the manager so your Service can still run transactions
  get manager() {
    return this.repo.manager;
  }

  findByUser(userId: number, roleId?: number) {
    return this.repo.find({
      where: {
        userId,
        ...(roleId ? { roleId } : {}),
      },
    });
  }

  findByAccount(accountId: number) {
    return this.repo.find({ where: { accountId } });
  }

  findOneByAccountAndUser(accountId: number, userId: number) {
    return this.repo.findOne({ where: { accountId, userId } });
  }
}
