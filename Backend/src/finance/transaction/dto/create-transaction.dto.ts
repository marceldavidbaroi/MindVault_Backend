// dto/create-transaction.dto.ts
import type {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../constants/transaction.constants';
export class CreateTransactionDto {
  accountId: number;
  categoryId?: number;

  type: TransactionType;
  paymentMethod?: PaymentMethod;
  amount: string;
  transactionDate: string;
  transactionStatus: TransactionStatus;

  description?: string;
  externalRefId?: string;
}
