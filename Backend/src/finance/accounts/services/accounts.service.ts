import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountRepository } from '../repository/account.repository';
import { Account } from '../entity/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { FilterAccountDto } from '../dto/filter-account.dto';
import { UpdateBalanceDto, BalanceAction } from '../dto/update-balance.dto';
import { AccountTransformer } from '../transformers/account.transformer';

import { User } from 'src/auth/entity/user.entity';
import { AccountValidator } from '../validators/account.validator';
import { safeAdd, safeSubtract } from 'src/common/utils/decimal-balance';
import { CurrencyValidator } from 'src/finance/currency/validators/currency.validator';
import { AccountTypeValidator } from '../validators/account-type.validator';
import { ACCOUNT_SCOPE_PREFIX } from '../utils/account-number.util';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly accountValidator: AccountValidator,
    private readonly currencyValidator: CurrencyValidator,
    private readonly accountTypeValidator: AccountTypeValidator,
  ) {}

  async create(user: User, dto: CreateAccountDto) {
    const accountType = await this.accountTypeValidator.ensureExists(
      dto.typeId,
    );

    await this.currencyValidator.ensureCurrencyExists(dto.currencyCode);

    const prefix = ACCOUNT_SCOPE_PREFIX[accountType.scope];

    const account = await this.accountRepo.manager.transaction(
      async (manager) => {
        // 1️⃣ Generate sequence
        const sequence = await this.accountRepo.getNextAccountSequence();

        const accountNumber = `${prefix}-${sequence}`;

        // 2️⃣ Persist account
        return manager.save(
          this.accountRepo.create({
            ...dto,
            ownerId: user.id,
            accountNumber,
            balance: dto.initialBalance || '0',
          }),
        );
      },
    );

    return {
      success: true,
      message: 'Account created',
      data: AccountTransformer.toResponse(account),
    };
  }

  async update(accountId: number, user: User, dto: UpdateAccountDto) {
    const account = await this.accountValidator.ensureExists(accountId);
    Object.assign(account, dto);
    await this.accountRepo.save(account);
    return {
      success: true,
      message: 'Account updated',
      data: AccountTransformer.toResponse(account),
    };
  }

  async delete(account: Account) {
    await this.accountRepo.remove(account);
    return { success: true, message: 'Account deleted', data: null };
  }

  async list(filter: FilterAccountDto) {
    const { data, total, page, limit } =
      await this.accountRepo.filterAndPaginate(filter);
    return {
      success: true,
      message: 'Accounts fetched',
      data: AccountTransformer.toResponseList(data),
      meta: { page, limit, total },
    };
  }

  async getById(id: number, relations: string[] = []) {
    const account = await this.accountValidator.ensureExists(id);

    return {
      success: true,
      message: 'Account fetched',
      data: AccountTransformer.toResponse(account),
    };
  }

  async getBalance(account: Account) {
    return {
      success: true,
      message: 'Balance fetched',
      data: {
        balance: account.balance,
        initialBalance: account.initialBalance,
      },
    };
  }

  async updateBalance(account: Account, dto: UpdateBalanceDto) {
    let newBalance: string;
    switch (dto.action) {
      case BalanceAction.ADD:
        newBalance = safeAdd(account.balance, dto.amount);
        break;
      case BalanceAction.SUBTRACT:
        newBalance = safeSubtract(account.balance, dto.amount);
        break;
      case BalanceAction.SET:
        newBalance = dto.amount;
        break;
      default:
        throw new BadRequestException('Invalid balance action');
    }
    account.balance = newBalance;
    await this.accountRepo.save(account);
    return {
      success: true,
      message: 'Balance updated',
      data: { balance: newBalance },
    };
  }
}
