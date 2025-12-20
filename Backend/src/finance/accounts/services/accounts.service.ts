import {
  Injectable,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
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
    private readonly dataSource: DataSource,
    private readonly accountRepo: AccountRepository,
    private readonly accountValidator: AccountValidator,
    private readonly currencyValidator: CurrencyValidator,
    private readonly accountTypeValidator: AccountTypeValidator,
    @Inject(forwardRef(() => AccountUserRolesService))
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

    const account = await this.dataSource.transaction(async (manager) => {
      let account = manager.create(Account, {
        ...dto,
        ownerId: user.id,
        balance: dto.initialBalance || '0',
        accountNumber: '', // temporary
      });

      account = await manager.save(account);

      account.accountNumber = `${prefix}-${account.id}`;
      await manager.save(account);

      // Assign owner role
      await this.accountUserRolesService.createOwner(manager, account.id, user);

      // Log account creation
      await this.accountLogService.create(manager, {
        account,
        user,
        action: 'CREATE_ACCOUNT',
        oldValue: null,
        newValue: null,
        source: 'account_service',
      });

      return account;
    });

    return {
      success: true,
      message: 'Account created',
      data: AccountTransformer.toResponse(account),
    };
  }

  async update(accountId: number, user: User, dto: UpdateAccountDto) {
    const account = await this.accountValidator.ensureExists(accountId);

    if (dto.currencyCode)
      await this.currencyValidator.ensureCurrencyExists(dto.currencyCode);
    if (dto.typeId) await this.accountTypeValidator.ensureExists(dto.typeId);

    const updatedAccount = await this.accountRepo.manager.transaction(
      async (manager) => {
        await this.accountUserRoleValidator.ensureOwnerOrAdmin(
          accountId,
          user.id,
          manager,
        );

        const oldValue = { ...account };

        Object.assign(account, dto);
        const savedAccount = await manager.save(account);

        // Log the update
        await this.accountLogService.create(manager, {
          account,
          user,
          action: 'UPDATE_ACCOUNT',
          oldValue,
          newValue: null,
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

    await this.accountRepo.manager.transaction(async (manager) => {
      await this.accountUserRoleValidator.ensureOwnerOrAdmin(
        accountId,
        user.id,
      );

      const oldValue = { ...account };
      await this.accountLogService.create(manager, {
        account,
        user,
        action: 'REMOVE_ACCOUNT',
        oldValue,
        newValue: null,
        source: 'account_service',
      });
      await manager.delete(Account, accountId);
      // Log the deletion
    });

    return {
      success: true,
      message: 'Account deleted successfully',
      data: null,
    };
  }

  async accountListOfCurrentUser(userId: number, filter: FilterAccountDto) {
    RelationValidator.validate(filter.relations, ACCOUNT_ALLOWED_RELATIONS);
    const accountIds = await this.accountUserRolesService.getUserAccounts(
      userId,
      filter.roleId,
    );
    const { data, total, page, limit } =
      await this.accountRepo.filterAndPaginate(filter, accountIds);
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
    manager: EntityManager, // Pass the transactional manager
    accountId: number,
    user: User,
    dto: UpdateBalanceDto,
    source?: string,
  ) {
    // Ensure the account exists
    const account = await this.accountValidator.ensureExists(
      accountId,
      manager,
    );

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

    account.balance = newBalance;
    await manager.save(account);

    // Log balance update using the same transactional manager
    await this.accountLogService.create(manager, {
      account,
      user,
      action: 'UPDATE_ACCOUNT_BALANCE',
      oldValue: { balance: oldBalance },
      newValue: { balance: newBalance },
      source: source || 'Account Service',
    });

    return newBalance;
  }

  async changeOwner(accountId: number, newOwnerId: number) {
    return this.accountRepo.changeOwner(accountId, newOwnerId);
  }
}
