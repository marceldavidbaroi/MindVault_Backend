import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { Account } from '../entity/account.entity';
import { FilterAccountDto } from '../dto/filter-account.dto';
import { safeAdd, safeSubtract } from 'src/common/utils/decimal-balance';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {
  /* ---------------------------------------------
   * Filtering + Pagination
   * ------------------------------------------- */
  async filterAndPaginate(filter: FilterAccountDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'DESC',
      name,
      relations,
    } = filter;

    let qb: SelectQueryBuilder<Account> = this.createQueryBuilder('account');

    if (relations) {
      relations.split(',').forEach((rel) => {
        qb = qb.leftJoinAndSelect(`account.${rel.trim()}`, rel.trim());
      });
    }

    if (name) {
      qb.andWhere('account.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

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

  /* ---------------------------------------------
   * Account Number Sequence
   * ------------------------------------------- */
  async getNextAccountSequence(): Promise<number> {
    const [{ nextval }] = await this.query(
      `SELECT nextval('account_number_seq')`,
    );
    return Number(nextval);
  }

  /* ---------------------------------------------
   * Balance Operations (Internal Use Only)
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
   * Ownership Update (Internal Use Only)
   * ------------------------------------------- */
  async changeOwner(accountId: number, newOwnerId: number): Promise<Account> {
    const account = await this.findOne({ where: { id: accountId } });

    if (!account) {
      throw new Error('Account not found'); // or let service/validator handle this
    }

    account.ownerId = newOwnerId;
    return this.save(account);
  }
}
