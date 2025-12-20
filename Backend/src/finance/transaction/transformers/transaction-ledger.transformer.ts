// transformers/account-ledger.transformer.ts
import { AccountLedger } from '../entity/transaction-ledger.entity';

export class AccountLedgerTransformer {
  static transform(entity: AccountLedger) {
    return {
      id: entity.id,
      accountId: entity.accountId,
      transactionId: entity.transactionId,
      entryType: entity.entryType,
      amount: entity.amount,
      balanceAfter: entity.balanceAfter,
      description: entity.description,
      createdAt: entity.createdAt,
    };
  }

  static transformMany(data: AccountLedger[]) {
    return data.map(this.transform);
  }
}
