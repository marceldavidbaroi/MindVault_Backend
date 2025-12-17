import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from '../repository/account.repository';

@Injectable()
export class AccountValidator {
  constructor(private readonly accountRepo: AccountRepository) {}

  async ensureExists(accountId: number) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }
    return account;
  }
}
