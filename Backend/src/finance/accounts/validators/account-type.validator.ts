import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountTypeRepository } from '../repository/account-type.repository';
import { AccountType } from '../entity/account-type.entity';

@Injectable()
export class AccountTypeValidator {
  constructor(private readonly accountTypeRepo: AccountTypeRepository) {}

  async ensureExists(id: number): Promise<AccountType> {
    const accountType = await this.accountTypeRepo.findById(id);
    if (!accountType) {
      throw new NotFoundException(`Account type with ID ${id} not found`);
    }
    return accountType;
  }
}
