import { TransactionType } from '../constants/transaction.constants';

// dto/query-transaction.dto.ts
export class QueryTransactionDto {
  page: number = 1;
  limit: number = 20;

  accountId?: number;
  creatorId?: number;
  categoryId?: number;
  type?: TransactionType;
  status?: string;

  fromDate?: string;
  toDate?: string;
}
