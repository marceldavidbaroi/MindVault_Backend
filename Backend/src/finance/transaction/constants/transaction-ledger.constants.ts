// constants/account-ledger.constants.ts
export const LEDGER_ENTRY_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
  REVERSAL_INCOME: 'reversal_income',
  REVERSAL_EXPENSE: 'reversal_expense',
} as const;

export type LedgerEntryType =
  (typeof LEDGER_ENTRY_TYPE)[keyof typeof LEDGER_ENTRY_TYPE];
