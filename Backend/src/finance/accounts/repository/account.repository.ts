import { Injectable } from '@nestjs/common';
import {
  Repository,
  DataSource,
  SelectQueryBuilder,
  EntityManager,
} from 'typeorm';
import { Account } from '../entity/account.entity';
import { FilterAccountDto } from '../dto/filter-account.dto';
import { safeAdd, safeSubtract } from 'src/common/utils/decimal-balance';

@Injectable()
export class AccountRepository extends Repository<Account> {
  constructor(private readonly dataSource: DataSource) {
    super(Account, dataSource.createEntityManager());
  }

  /* ---------------------------------------------
   * Filtering + Pagination
   * ------------------------------------------- */
  async filterAndPaginate(filter: FilterAccountDto, accountIds: number[]) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'DESC',
      name,
      relations,
    } = filter;

    // Use the repo instance if you followed the previous fix
    let qb = this.createQueryBuilder('account');

    // 1️⃣ FILTER BY SPECIFIC ACCOUNT NUMBERS / IDS
    // If no IDs are provided, we should return an empty set or throw to prevent fetching all
    if (!accountIds || accountIds.length === 0) {
      return { data: [], total: 0, page, limit };
    }

    qb.where('account.id IN (:...accountIds)', { accountIds });

    // 2️⃣ DYNAMIC RELATIONS
    if (relations) {
      relations.split(',').forEach((rel) => {
        qb = qb.leftJoinAndSelect(`account.${rel.trim()}`, rel.trim());
      });
    }

    // 3️⃣ SEARCH BY NAME (Optional additional filter)
    if (name) {
      qb.andWhere('account.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    // 4️⃣ PAGINATION & SORTING
    const [data, total] = await qb
      .orderBy(`account.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /* ---------------------------------------------
   * Find by ID with optional relations
   * ------------------------------------------- */
  async findById(id: number, relations: string[] = []) {
    return this.findOne({
      where: { id },
      relations: relations.length ? relations : [],
    });
  }

  // /* ---------------------------------------------
  //  * Account Number Sequence (FIXED)
  //  * ------------------------------------------- */
  // async getNextAccountSequence(manager?: EntityManager): Promise<number> {
  //   const executor = manager ?? this.dataSource;

  //   const [{ nextval }] = await executor.query(
  //     `SELECT nextval('account_number_seq')`,
  //   );

  //   return Number(nextval);
  // }

  /* ---------------------------------------------
   * Balance Operations
   * ------------------------------------------- */
  async addBalance(account: Account, amount: string): Promise<Account> {
    account.balance = safeAdd(account.balance, amount);
    return this.save(account);
  }

  async subtractBalance(account: Account, amount: string): Promise<Account> {
    account.balance = safeSubtract(account.balance, amount);
    return this.save(account);
  }

  async setBalance(account: Account, amount: string): Promise<Account> {
    account.balance = amount;
    return this.save(account);
  }

  /* ---------------------------------------------
   * Lightweight balance fetch
   * ------------------------------------------- */
  async getBalance(accountId: number): Promise<string> {
    const account = await this.findOne({
      select: ['balance'],
      where: { id: accountId },
    });

    return account?.balance ?? '0';
  }

  /* ---------------------------------------------
   * Ownership Update
   * ------------------------------------------- */
  async changeOwner(accountId: number, newOwnerId: number): Promise<Account> {
    const account = await this.findOne({ where: { id: accountId } });

    if (!account) {
      throw new Error('Account not found');
    }

    account.ownerId = newOwnerId;
    return this.save(account);
  }
}
