import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { User } from 'src/auth/user.entity';
import { AccountType } from '../account_types/account_types.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  /** CREATE */
  async create(dto: CreateAccountDto, user: User): Promise<Account> {
    if (!user) {
      throw new BadRequestException('Cannot create account without a user');
    }

    // If accountTypeId is provided, link the AccountType
    let accountType: AccountType | undefined = undefined;
    if (dto.accountTypeId) {
      accountType = { id: dto.accountTypeId } as AccountType;
    }

    const account = this.accountRepo.create({
      ...dto,
      ownerUser: user,
      accountType,
    });

    return await this.accountRepo.save(account);
  }

  /** FIND ALL (only owned by user) */
  async findAll(userId: number): Promise<Account[]> {
    return await this.accountRepo.find({
      where: { ownerUser: { id: userId } },
      relations: ['ownerUser', 'accountType'],
      order: { createdAt: 'DESC' },
    });
  }

  /** FIND ONE */
  async findOne(id: number): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['ownerUser', 'accountType'],
    });
    if (!account)
      throw new NotFoundException(`Account with ID ${id} not found`);
    return account;
  }

  /** UPDATE (only owner can update) */
  async update(
    id: number,
    dto: UpdateAccountDto,
    userId: number,
  ): Promise<Account> {
    const account = await this.findOne(id);

    if (account.ownerUser.id !== userId) {
      throw new BadRequestException(
        'You are not allowed to update this account',
      );
    }

    // If accountTypeId is provided, link the new AccountType
    if (dto.accountTypeId) {
      account.accountType = { id: dto.accountTypeId } as AccountType;
    }

    Object.assign(account, dto);
    return await this.accountRepo.save(account);
  }

  /** DELETE (only owner can delete) */
  async remove(id: number, userId: number): Promise<void> {
    const account = await this.findOne(id);

    if (account.ownerUser.id !== userId) {
      throw new BadRequestException(
        'You are not allowed to delete this account',
      );
    }

    await this.accountRepo.remove(account);
  }
}
