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
import { User } from 'src/auth/entities/user.entity';
import { AccountUserRolesService } from './account-user-roles.service.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @Inject(forwardRef(() => AccountUserRolesService))
    private readonly accountUserRolesService: AccountUserRolesService,
  ) {}

  async createAccount(user: User, dto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepo.create({
      name: dto.name,
      description: dto.description,
      initialBalance: String(dto.initialBalance ?? '0'),
      balance: String(dto.initialBalance ?? '0'),
      type: { id: dto.accountTypeId },
      ownerId: user.id,
    });

    const savedAccount = await this.accountRepo.save(account);

    await this.accountUserRolesService.assignRole(user, savedAccount.id, {
      userId: user.id,
      roleId: 1,
    });

    return savedAccount;
  }

  async updateAccount(
    id: number,
    dto: UpdateAccountDto,
    user: User,
  ): Promise<Account> {
    const account = await this.getAccountByIdAndUser(id, user);
    Object.assign(account, dto);
    return await this.accountRepo.save(account);
  }

  async deleteAccount(id: number, user: User): Promise<void> {
    const account = await this.getAccountByIdAndUser(id, user);
    await this.accountRepo.remove(account);
  }

  async getAccount(id: number, user: User): Promise<Account> {
    return await this.getAccountByIdAndUser(id, user);
  }

  async listAccounts(user: User): Promise<Account[]> {
    return await this.accountRepo.find({ where: { ownerId: user.id } });
  }

  private async getAccountByIdAndUser(
    id: number,
    user: User,
  ): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, ownerId: user.id },
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
