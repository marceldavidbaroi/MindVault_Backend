import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entity/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { User } from 'src/auth/entity/user.entity';
import { AccountUserRolesService } from './account-user-roles.service.service';
import { CurrencyService } from 'src/finance/currency/services/currency.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @Inject(forwardRef(() => AccountUserRolesService))
    private readonly accountUserRolesService: AccountUserRolesService,
    private readonly currencyService: CurrencyService,
  ) {}

  async createAccount(user: User, dto: CreateAccountDto): Promise<Account> {
    const currency = await this.currencyService.verifyCurrency(
      dto.currencyCode,
    );
    const account = this.accountRepo.create({
      name: dto.name,
      description: dto.description,
      currency: currency,
      initialBalance: String(dto.initialBalance ?? '0'),
      balance: String(dto.initialBalance ?? '0'),
      type: { id: dto.accountTypeId },
      ownerId: user.id,
    });

    const savedAccount = await this.accountRepo.save(account);

    await this.accountUserRolesService.assignOwnerRole(user, savedAccount);

    return savedAccount;
  }

  async updateAccount(
    id: number,
    dto: UpdateAccountDto,
    user: User,
  ): Promise<Account> {
    const account = await this.getAccountByIdAndUser(id, user);
    const userRole = await this.accountUserRolesService.findOne(
      account.id,
      user.id,
    );
    if (userRole.role.name !== 'owner' && userRole.role.name !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this account.',
      );
    }
    if (dto.name)
      // Update primitive fields
      account.name = dto.name;
    if (account.description) account.description = dto.description ?? null;

    // Update currency relation
    if (dto.currencyCode) {
      const currency = await this.currencyService.verifyCurrency(
        dto.currencyCode,
      );
      account.currency = currency;
    }

    // Update account type relation
    if (dto.accountTypeId) {
      account.type = { id: dto.accountTypeId } as any; // TypeORM will understand this as relation update
    }

    return await this.accountRepo.save(account);
  }

  async deleteAccount(id: number, user: User): Promise<void> {
    const account = await this.getAccountByIdAndUser(id, user);
    const userRole = await this.accountUserRolesService.findOne(
      account.id,
      user.id,
    );
    if (userRole.role.name !== 'owner' && userRole.role.name !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to update this account.',
      );
    }

    await this.accountRepo.remove(account);
  }

  async getAccount(id: number, user: User): Promise<any> {
    // 🔹 Step 1: Fetch account with relations
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['type', 'currency'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    const hasAccess = await this.accountUserRolesService.findOne(id, user.id);

    if (!hasAccess) {
      throw new NotFoundException(`You have no access to view this account`);
    }
    // 🔹 Step 3: Get users and roles using your existing method
    const userRoles = await this.accountUserRolesService.listRoles(id);

    // 🔹 Step 4: Format output neatly
    const users = userRoles.map((ur) => ({
      id: ur.user.id,
      username: ur.user.username,
      email: ur.user.email,
      role: {
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName,
        description: ur.role.description,
      },
    }));

    // 🔹 Step 5: Return full account details
    return {
      ...account,
      users,
    };
  }

  async listAccounts(user: User): Promise<any[]> {
    const qb = this.accountRepo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.type', 'type')
      .leftJoinAndSelect('account.currency', 'currency') // join correct relation
      .select([
        'account.id',
        'account.name',
        'account.balance',
        'account.description',
        'type.id',
        'type.name',
        'currency.code',
        'currency.name',
        'currency.symbol',
      ])
      .where('account.ownerId = :ownerId', { ownerId: user.id });

    const accounts = await qb.getMany();
    return accounts;
  }

  private async getAccountByIdAndUser(
    id: number,
    user: User,
  ): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, ownerId: user.id },
      relations: ['type'],
    });
    if (!account) {
      throw new NotFoundException(
        `Account with ID ${id} not found or not owned by user`,
      );
    }
    return account;
  }

  // 🆕 ---- BALANCE FUNCTIONS ----

  /** ✅ Update the balance of an account */
  async updateBalance(accountId: number, newBalance: string): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    account.balance = newBalance;
    return await this.accountRepo.save(account);
  }

  /** ✅ Get the current balance of an account */
  async getBalance(accountId: number): Promise<string> {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
      select: ['id', 'balance'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    return account.balance;
  }
}
