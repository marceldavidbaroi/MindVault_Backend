import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entity/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async createAccount(user: User, dto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepo.create({
      name: dto.name,
      description: dto.description,
      initialBalance: dto.initialBalance,
      type: { id: dto.accountTypeId }, // TypeORM will handle this
      ownerId: user.id,
    });
    return await this.accountRepo.save(account);
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
}
