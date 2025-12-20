// transformers/transaction.transformer.ts
import { Transaction } from '../entity/transaction.entity';

export class TransactionTransformer {
  transform(entity: Transaction) {
    return {
      id: entity.id,
      accountId: entity.accountId,
      creatorId: entity.creatorId,
      type: entity.type,
      amount: entity.amount,
      status: entity.status,
      transactionDate: entity.transactionDate,
      description: entity.description,
      createdAt: entity.createdAt,
    };
  }

  transformMany(data: Transaction[]) {
    return data.map(this.transform);
  }
}
