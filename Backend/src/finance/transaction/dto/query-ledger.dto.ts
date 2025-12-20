import { LedgerEntryType } from '../constants/transaction-ledger.constants';

// dto/query-ledger.dto.ts
export class QueryLedgerDto {
  page?: number = 1;
  limit?: number = 20;
  entryType?: LedgerEntryType;
  fromDate?: Date;
  toDate?: Date;
}
