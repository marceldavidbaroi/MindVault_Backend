// services/account-ledger-reversal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AccountLedger } from '../entity/account-ledger.entity';
import { UpdateLedgerDto } from '../dto/update-ledger.dto';
import { LEDGER_ENTRY_TYPE } from '../constants/transaction-ledger.constants';

@Injectable()
export class AccountLedgerReversalService {
  async reverseAndCreate(
    manager: EntityManager,
    ledgerId: number,
    dto: UpdateLedgerDto,
    creatorId: number,
  ) {
    const repo = manager.getRepository(AccountLedger);

    const original = await repo.findOne({ where: { id: ledgerId } });
    if (!original) throw new NotFoundException('Ledger entry not found');

    /**
     * 🔁 Reversal entry
     */
    const reversalType =
      original.entryType === LEDGER_ENTRY_TYPE.INCOME
        ? LEDGER_ENTRY_TYPE.REVERSAL_INCOME
        : LEDGER_ENTRY_TYPE.REVERSAL_EXPENSE;

    const reversal = repo.create({
      accountId: original.accountId,
      transactionId: original.transactionId,
      entryType: reversalType,
      amount: original.amount,
      balanceAfter: original.balanceAfter, // ⚠️ Balance logic placeholder
      creatorId,
      description: `Reversal of ledger #${original.id}`,
    });

    /**
     * 🆕 Corrected entry
     */
    const corrected = repo.create({
      accountId: original.accountId,
      transactionId: original.transactionId,
      entryType: original.entryType,
      amount: dto.amount,
      description: dto.description,
      transactionSnapshot: dto.transactionSnapshot,
      balanceAfter: original.balanceAfter, // ⚠️ Balance logic placeholder
      creatorId,
    });

    await repo.save([reversal, corrected]);

    return { reversal, corrected };
  }
}
