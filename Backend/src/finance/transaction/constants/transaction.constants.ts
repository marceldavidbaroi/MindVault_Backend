// constants/transaction.constants.ts

/** Transaction Type */
export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;
export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

/** Transaction Status */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CLEARED: 'cleared',
  VOID: 'void',
  FAILED: 'failed',
} as const;
export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

/** Payment Method */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  DIGITAL: 'digital',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
} as const;
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
