// dto/create-transaction.dto.ts
import type {
  PaymentMethod,
  TransactionType,
} from '../constants/transaction.constants';
export class UpdateTransactionDto {
  categoryId?: number;

  type: TransactionType;
  paymentMethod?: PaymentMethod;
  amount: string;
  transactionDate: string;

  description?: string;
  externalRefId?: string;
}
