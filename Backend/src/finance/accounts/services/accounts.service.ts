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
import { AccountUserRolesService } from './account-user-roles.service';
import { AccountLogService } from './account-log.service';
import { AccountUserRoleValidator } from '../validators/account-user-role.validator';
import { RelationValidator } from 'src/common/validators/relation.validator';
import { ACCOUNT_ALLOWED_RELATIONS } from '../constants/account.constants';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly accountValidator: AccountValidator,
    private readonly currencyValidator: CurrencyValidator,
    private readonly accountTypeValidator: AccountTypeValidator,
    private readonly accountUserRolesService: AccountUserRolesService,
    private readonly accountLogService: AccountLogService,
    private readonly accountUserRoleValidator: AccountUserRoleValidator,
  ) {}

  async create(user: User, dto: CreateAccountDto) {
    const accountType = await this.accountTypeValidator.ensureExists(
      dto.typeId,
    );

    await this.currencyValidator.ensureCurrencyExists(dto.currencyCode);

    const prefix = ACCOUNT_SCOPE_PREFIX[accountType.scope];

    const account = await this.accountRepo.manager.transaction(
      async (manager) => {
        // 1️⃣ Generate account number
        const sequence = await this.accountRepo.getNextAccountSequence();
        const accountNumber = `${prefix}-${sequence}`;

        // 2️⃣ Create account
        const account = await manager.save(
          this.accountRepo.create({
            ...dto,
            ownerId: user.id,
            accountNumber,
            balance: dto.initialBalance || '0',
          }),
        );

        // 3️⃣ Create owner role
        await this.accountUserRolesService.createOwner(
          manager,
          account.id,
          user,
        );

        // 4️⃣ Log account creation
        await this.accountLogService.create(manager, {
          accountId: account.id,
          userId: user.id,
          action: 'CREATE_ACCOUNT',
          oldValue: null,
          newValue: {
            id: account.id,
            accountNumber: account.accountNumber,
            ownerId: account.ownerId,
            typeId: account.typeId,
            currencyCode: account.currencyCode,
            balance: account.balance,
          },
          source: 'manual',
        });

        return account;
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

    if (dto.currencyCode) {
      await this.currencyValidator.ensureCurrencyExists(dto.currencyCode);
    }

    if (dto.typeId) {
      await this.accountTypeValidator.ensureExists(dto.typeId);
    }

    // Transaction ensures atomicity
    const updatedAccount = await this.accountRepo.manager.transaction(
      async (manager) => {
        // 1️⃣ Check permissions inside transaction
        await this.accountUserRoleValidator.ensureOwnerOrAdmin(
          accountId,
          user.id,
        );

        // 2️⃣ Snapshot old value for logging
        const oldValue = {
          name: account.name,
          description: account.description,
          currencyCode: account.currencyCode,
          typeId: account.typeId,
          balance: account.balance,
        };

        // 3️⃣ Update account fields
        Object.assign(account, dto);
        const savedAccount = await manager.save(account);

        // 4️⃣ Log the update
        await this.accountLogService.create(manager, {
          accountId: account.id,
          userId: user.id,
          action: 'UPDATE_ACCOUNT',
          oldValue,
          newValue: {
            name: savedAccount.name,
            description: savedAccount.description,
            currencyCode: savedAccount.currencyCode,
            typeId: savedAccount.typeId,
            balance: savedAccount.balance,
          },
          source: 'account_service',
        });

        return savedAccount;
      },
    );

    return {
      success: true,
      message: 'Account updated successfully',
      data: AccountTransformer.toResponse(updatedAccount),
    };
  }

  async delete(accountId: number, user: User) {
    const account = await this.accountValidator.ensureExists(accountId);

    const deletedAccount = await this.accountRepo.manager.transaction(
      async (manager) => {
        // 1️⃣ Ensure the user is owner/admin
        await this.accountUserRoleValidator.ensureOwnerOrAdmin(
          accountId,
          user.id,
        );

        // 2️⃣ Snapshot old values for logging
        const oldValue = {
          name: account.name,
          description: account.description,
          currencyCode: account.currencyCode,
          typeId: account.typeId,
          balance: account.balance,
        };

        // 3️⃣ Remove account
        await manager.remove(account);

        // 4️⃣ Log the deletion
        await this.accountLogService.create(manager, {
          accountId: account.id,
          userId: user.id,
          action: 'REMOVE_ACCOUNT',
          oldValue,
          newValue: null,
          source: 'account_service',
        });

        return account;
      },
    );

    return {
      success: true,
      message: 'Account deleted successfully',
      data: null,
    };
  }

  async list(filter: FilterAccountDto) {
    RelationValidator.validate(filter.relations, ACCOUNT_ALLOWED_RELATIONS);
    const { data, total, page, limit } =
      await this.accountRepo.filterAndPaginate(filter);
    return {
      success: true,
      message: 'Accounts fetched',
      data: AccountTransformer.toResponseList(data),
      meta: { page, limit, total },
    };
  }

  async getById(id: number) {
    const account = await this.accountValidator.ensureExistsWithRelation(id);

    return {
      success: true,
      message: 'Account fetched',
      data: AccountTransformer.toResponse(account),
    };
  }

  async getBalance(accountId: number) {
    const account = await this.accountValidator.ensureExists(accountId);
    return {
      success: true,
      message: 'Balance fetched',
      data: {
        balance: account.balance,
        initialBalance: account.initialBalance,
      },
    };
  }

  async updateBalance(
    accountId: number,
    user: User,
    dto: UpdateBalanceDto,
    source?: string,
  ) {
    return this.accountRepo.manager.transaction(async (manager) => {
      // 1️⃣ Fetch account
      const account = await this.accountValidator.ensureExists(accountId);

      // 2️⃣ Compute new balance
      const oldBalance = account.balance;
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

      // 3️⃣ Save updated balance
      account.balance = newBalance;
      await manager.save(account);

      // 4️⃣ Create account log
      await this.accountLogService.create(manager, {
        accountId: account.id,
        userId: user.id,
        action: 'UPDATE_ACCOUNT_BALANCE',
        oldValue: { balance: oldBalance },
        newValue: { balance: newBalance },
        source: source || 'Account Service',
      });

      // 5️⃣ Return response
      return {
        success: true,
        message: 'Balance updated',
        data: { balance: newBalance },
      };
    });
  }

  async changeOwner(accountId: number, newOwnerId: number) {
    return this.accountRepo.changeOwner(accountId, newOwnerId);
  }
}
