// services/account-ledger.service.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ApiResponse } from 'src/common/types/api-response.type';
import { CreateLedgerDto } from '../dto/create-ledger.dto';
import { AccountLedger } from '../entity/account-ledger.entity';
import { AccountLedgerRepository } from '../repository/account-ledger.repository';
import { AccountLedgerTransformer } from '../transformers/transaction-ledger.transformer';
import { QueryLedgerDto } from '../dto/query-ledger.dto';

@Injectable()
export class TransactionLedgerService {
  constructor(
    private readonly repository: AccountLedgerRepository,
    private readonly transformer: AccountLedgerTransformer,
  ) {}

  async create(
    manager: EntityManager,
    dto: CreateLedgerDto,
  ): Promise<ApiResponse<any>> {
    const repo = manager.getRepository(AccountLedger);

    /**
     * ⚠️ BALANCE SOURCE OF TRUTH
     * ----------------------------------
     * Decide later:
     * - Pull from Account table with SELECT FOR UPDATE
     * - Or compute from last ledger entry
     */
    const balanceAfter = '0.00'; // placeholder

    const saved = await repo.save(
      repo.create({
        ...dto,
        creatorId,
        balanceAfter,
      }),
    );

    return {
      success: true,
      message: 'Ledger entry created',
      data: this.transformer.transform(saved),
    };
  }

  async listByAccount(accountId: number, query: QueryLedgerDto) {
    const result = await this.repository.listByAccount(accountId, query);
    return {
      success: true,
      message: 'Account ledger retrieved',
      data: this.transformer.transformMany(result.data),
      meta: result,
    };
  }

  async listByUser(userId: number, query: QueryLedgerDto) {
    const result = await this.repository.listByUser(userId, query);
    return {
      success: true,
      message: 'User ledger retrieved',
      data: this.transformer.transformMany(result.data),
    };
  }
}
