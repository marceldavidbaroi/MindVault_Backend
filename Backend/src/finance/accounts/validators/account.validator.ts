import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from '../repository/account.repository';
import { ACCOUNT_ALLOWED_RELATIONS } from '../constants/account.constants';
import { EntityManager } from 'typeorm';
import { Account } from '../entity/account.entity';

@Injectable()
export class AccountValidator {
  constructor(private readonly accountRepo: AccountRepository) {}

  async ensureExists(accountId: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Account) : this.accountRepo; // fallback to injected repository if no manager

    const account = await repo.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    return account;
  }

  async ensureExistsWithRelation(accountId: number) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
      relations: ACCOUNT_ALLOWED_RELATIONS,
    });
    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }
    return account;
  }
}
