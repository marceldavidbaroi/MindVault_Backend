import { Injectable } from '@nestjs/common';
import { AccountTypeRepository } from '../repository/account-type.repository';
import { AccountTypeValidator } from '../validators/account-type.validator';
import { AccountTypeTransformer } from '../transformers/account-type.transformer';

@Injectable()
export class AccountTypesService {
  constructor(
    private readonly accountTypeRepo: AccountTypeRepository,
    private readonly validator: AccountTypeValidator,
  ) {}

  async listAccountTypes() {
    const types = await this.accountTypeRepo.findActive();
    return {
      success: true,
      message: 'Account types fetched successfully',
      data: AccountTypeTransformer.toResponseList(types),
    };
  }

  async getAccountType(id: number) {
    const type = await this.validator.ensureExists(id);
    return {
      success: true,
      message: 'Account type fetched successfully',
      data: AccountTypeTransformer.toResponse(type),
    };
  }
}
