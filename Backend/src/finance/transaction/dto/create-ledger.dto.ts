// dto/create-ledger.dto.ts
import { LedgerEntryType } from '../constants/transaction-ledger.constants';

export class CreateLedgerDto {
  accountId: number;
  transactionId: number;
  transactionSnapshot?: any;
  creatorId: number;
  creatorSnapshot: any;
  entryType: LedgerEntryType;
  amount: string;
  balanceAfter: string;
  description?: string;
  externalRefId?: string;
}
