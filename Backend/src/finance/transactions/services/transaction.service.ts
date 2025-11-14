import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { User } from 'src/auth/entities/user.entity';
import { VerifyUserService } from 'src/auth/services/verify-user.service';
import { CurrencyService } from 'src/finance/currency/services/currency.service';
import { CategoriesService } from 'src/finance/categories/categories.service';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { AccountUserRolesService } from 'src/finance/accounts/services/account-user-roles.service.service';
import { ListTransactionsFilterDto } from '../dto/list-transactions.dto';
import { SummaryWorkerService } from 'src/finance/summary/services/summary-worker.service';
import { LedgerService } from './ledger.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly verifyUserService: VerifyUserService,
    private readonly currencyService: CurrencyService,
    private readonly categoryService: CategoriesService,
    private readonly dataSource: DataSource,
    private readonly accountUserRolesService: AccountUserRolesService,
    private readonly summaryWorkerService: SummaryWorkerService,
    private readonly accountService: AccountsService,
    private readonly ledgerService: LedgerService,
  ) {}

  async createTransaction(
    userId: number,
    dto: CreateTransactionDto,
  ): Promise<{ success: boolean; message: string; data?: Transaction }> {
    return await this.dataSource.transaction(async (manager) => {
      // validate user exists
      const user: User = await this.verifyUserService.verify(userId);

      // validate account
      const account = await this.accountUserRolesService.getUserRoleForAccount(
        userId,
        dto.accountId,
      );

      // optional category and currency validation
      const category = dto.categoryId
        ? await this.categoryService.verifyCategory(dto.categoryId)
        : undefined;

      const currency = dto.currencyCode
        ? await this.currencyService.verifyCurrency(dto.currencyCode)
        : undefined;

      // externalRefId must be unique
      if (dto.externalRefId) {
        const existing = await manager.findOne(Transaction, {
          where: { externalRefId: dto.externalRefId },
        });
        if (existing)
          throw new BadRequestException('externalRefId must be unique');
      }

      // create transaction entity
      const tx = this.transactionRepo.create({
        account,
        creatorUser: user,
        category,
        type: dto.type,
        amount: dto.amount,
        currency,
        transactionDate: dto.transactionDate,
        description: dto.description,
        status: dto.status ?? 'pending',
        externalRefId: dto.externalRefId,
        recurring: dto.recurring ?? false,
        recurringInterval: dto.recurringInterval,
      });

      // save transaction
      const savedTx = await manager.save(tx);

      // update account balance
      const currentBalance = Number(
        await this.accountService.getBalance(dto.accountId),
      );
      const amount = Number(dto.amount);
      const newBalance =
        dto.type === 'income'
          ? currentBalance + amount
          : currentBalance - amount;
      await this.accountService.updateBalance(
        dto.accountId,
        newBalance.toFixed(2),
      );

      // update summaries
      await this.summaryWorkerService.handleTransaction(savedTx);

      // create ledger entry (transaction-safe)
      await this.ledgerService.createEntry(
        {
          accountId: account.id,
          creatorId: user.id,
          entryType: dto.type,
          amount,
          description: dto.description ?? `Transaction #${savedTx.id} created`,
          transactionId: savedTx.id,
        },
        manager,
      );

      return { success: true, message: 'Transaction created', data: savedTx };
    });
  }

  async getTransaction(id: number) {
    const tx = await this.transactionRepo.findOne({ where: { id } });
    if (!tx) return { success: false, message: 'Transaction not found' };
    return { success: true, message: 'OK', data: tx };
  }

  async listTransactions(
    accountId: number,
    filters: ListTransactionsFilterDto,
  ) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.account', 'account')
      .leftJoin('t.creatorUser', 'creator')
      .leftJoin('t.category', 'category')
      .leftJoin('t.currency', 'currency')
      .select([
        't.id',
        't.type',
        't.amount',
        't.transactionDate',
        't.description',
        't.status',
        't.recurring',
        't.recurringInterval',
        't.externalRefId',
        'account.id',
        'account.name',
        'category.id',
        'category.name',
        'currency.code',
        'currency.symbol',
        'creator.id',
        'creator.username',
      ]);

    qb.where('account.id = :accountId', { accountId });

    if (filters.categoryId)
      qb.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters.type) qb.andWhere('t.type = :type', { type: filters.type });
    if (filters.status)
      qb.andWhere('t.status = :status', { status: filters.status });
    if (filters.creatorUserId)
      qb.andWhere('creator.id = :creatorUserId', {
        creatorUserId: filters.creatorUserId,
      });
    if (filters.from)
      qb.andWhere('t.transactionDate >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('t.transactionDate <= :to', { to: filters.to });

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

    qb.skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('t.transactionDate', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    const formattedItems = items.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      transactionDate: t.transactionDate,
      description: t.description,
      status: t.status,
      recurring: t.recurring,
      recurringInterval: t.recurringInterval,
      externalRefId: t.externalRefId,
      account: t.account ? { id: t.account.id, name: t.account.name } : null,
      category: t.category
        ? { id: t.category.id, name: t.category.name }
        : null,
      currency: t.currency
        ? { symbol: t.currency.symbol, code: t.currency.code }
        : null,
      creatorUser: t.creatorUser
        ? { id: t.creatorUser.id, username: t.creatorUser.username }
        : null,
    }));

    return {
      success: true,
      message: 'OK',
      data: { items: formattedItems, total, page, pageSize },
    };
  }

  async updateTransaction(id: number, dto: UpdateTransactionDto) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account', 'currency', 'creatorUser', 'category'],
      });
      if (!tx) return { success: false, message: 'Transaction not found' };

      const oldTx = { ...tx };
      let ledgerNeeded = false;
      const oldAmount = Number(tx.amount);
      const oldType = tx.type;
      const oldAccountId = tx.account.id;

      // balance recalculation if amount/type changed
      if (
        (dto.amount && dto.amount !== tx.amount) ||
        (dto.type && dto.type !== tx.type)
      ) {
        ledgerNeeded = true;
        const balance = Number(
          await this.accountService.getBalance(oldAccountId),
        );
        let newBalance =
          oldType === 'income' ? balance - oldAmount : balance + oldAmount;
        const newAmount = Number(dto.amount ?? tx.amount);
        const newType = dto.type ?? tx.type;
        newBalance =
          newType === 'income'
            ? newBalance + newAmount
            : newBalance - newAmount;
        await this.accountService.updateBalance(
          oldAccountId,
          newBalance.toFixed(2),
        );
      }

      // externalRefId unique check
      if (dto.externalRefId && dto.externalRefId !== tx.externalRefId) {
        const exists = await manager.findOne(Transaction, {
          where: { externalRefId: dto.externalRefId },
        });
        if (exists && exists.id !== id)
          throw new BadRequestException('externalRefId already exists');
        tx.externalRefId = dto.externalRefId;
      }

      // update allowed fields
      const allowed = [
        'amount',
        'type',
        'description',
        'transactionDate',
        'status',
        'recurring',
        'recurringInterval',
      ];
      allowed.forEach((f) => {
        if (dto[f] !== undefined) tx[f] = dto[f];
      });

      // update relations
      if (dto.accountId) tx.account = { id: dto.accountId } as any;
      if (dto.categoryId) tx.category = { id: dto.categoryId } as any;
      if (dto.currencyCode) tx.currency = { code: dto.currencyCode } as any;

      const updated = await manager.save(tx);

      await this.summaryWorkerService.handleTransactionUpdate(oldTx, updated);

      if (ledgerNeeded) {
        await this.ledgerService.createEntry(
          {
            accountId: updated.account.id,
            creatorId: updated.creatorUser.id,
            entryType: updated.type,
            amount: Number(updated.amount),
            description:
              dto.description ?? `Transaction #${updated.id} updated`,
            transactionId: updated.id,
          },
          manager,
        );
      }

      return { success: true, message: 'Transaction updated', data: updated };
    });
  }

  async deleteTransaction(id: number) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account', 'creatorUser'],
      });
      if (!tx) return { success: false, message: 'Transaction not found' };

      const oldAmount = Number(tx.amount);
      const oldType = tx.type;
      const balance = Number(
        await this.accountService.getBalance(tx.account.id),
      );
      const newBalance =
        oldType === 'income' ? balance - oldAmount : balance + oldAmount;

      await this.accountService.updateBalance(
        tx.account.id,
        newBalance.toFixed(2),
      );

      await this.summaryWorkerService.handleTransactionDelete(tx);

      await manager.delete(Transaction, id);

      await this.ledgerService.createEntry(
        {
          accountId: tx.account.id,
          creatorId: tx.creatorUser.id,
          entryType: oldType === 'income' ? 'expense' : 'income',
          amount: oldAmount,
          description: `Transaction #${id} deleted`,
          transactionId: id,
        },
        manager,
      );

      return { success: true, message: 'Transaction deleted' };
    });
  }
}
