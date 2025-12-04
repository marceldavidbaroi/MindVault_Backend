Here’s a comprehensive **Markdown README** for your Transactions + Ledger module:

```markdown
# Transactions & Ledger Module

## Overview

This module handles all financial transactions, account ledgers, and recurring transactions in the system.  
It ensures account balances are updated, ledger entries are immutable, and supports bulk transactions and optimized statements.

---

## Entities

### Transaction

- Tracks individual financial transactions.
- Key fields:
  - `id`: Primary key
  - `account`: Linked account
  - `creatorUser`: User who created the transaction
  - `category`: Optional category
  - `currency`: Optional currency
  - `type`: `'income' | 'expense'`
  - `amount`: Decimal string
  - `transactionDate`: Date of transaction
  - `status`: `'pending' | 'cleared' | 'void' | 'failed'`
  - `recurring`: Boolean
  - `recurringInterval`: `'daily' | 'weekly' | 'monthly' | 'yearly'`
  - `externalRefId`: Optional unique external reference
  - `createdAt` / `updatedAt`

### AccountLedger

- Immutable ledger of account transactions.
- Key fields:
  - `id`: Primary key
  - `accountId`
  - `creatorId`
  - `transactionId`: Optional link to Transaction
  - `entryType`: `'income' | 'expense'`
  - `amount`
  - `balanceAfter`: Account balance after this entry
  - `description`
  - `createdAt`

### RecurringTransactionSchedule

- Schedules recurring transactions.
- Key fields:
  - `id`
  - `transaction`: Linked transaction
  - `owner`: User who owns the schedule
  - `nextRunDate`: Next occurrence
  - `interval`: `'daily' | 'weekly' | 'monthly' | 'yearly'`
  - `active`: Boolean
  - `createdAt` / `updatedAt`

---

## Endpoints

| Method | Route                                   | Description                   | Auth Required | Notes                                                                 |
| ------ | --------------------------------------- | ----------------------------- | ------------- | --------------------------------------------------------------------- |
| POST   | `/transactions`                         | Create a new transaction      | ✅            | Updates account balance, summary tables, ledger                       |
| POST   | `/transactions/bulk`                    | Bulk create transactions      | ✅            | Single DB transaction, ledger entries auto-created                    |
| GET    | `/transactions/:accountId/transactions` | List transactions for account | ✅            | Supports filters, pagination, sorting                                 |
| GET    | `/transactions/:id`                     | Get transaction by ID         | ✅            | Includes account, category, currency, creator                         |
| PUT    | `/transactions/:id`                     | Update transaction            | ✅            | Recalculates balance, updates summary, creates ledger entry if needed |
| DELETE | `/transactions/:id`                     | Delete transaction            | ✅            | Reverts balance, removes from summary, creates reverse ledger entry   |
| GET    | `/transactions/:accountId/statement`    | Optimized statement           | ✅            | Opening balance + running balance + closing balance                   |

---

## DTOs

### CreateTransactionDto

- `accountId` (number, required)
- `type` (`'income' | 'expense'`, required)
- `amount` (string, required)
- `transactionDate` (string, required)
- `categoryId` (optional)
- `currencyCode` (optional)
- `description` (optional)
- `status` (optional)
- `externalRefId` (optional, unique)
- `recurring` (optional)
- `recurringInterval` (optional)

### UpdateTransactionDto

- Partial update of transaction fields:
  - `amount`, `type`, `description`, `transactionDate`, `status`, `recurring`, `recurringInterval`, `categoryId`, `currencyCode`, `accountId`, `externalRefId`

### BulkCreateTransactionDto

- `accountId`
- `transactions`: Array of `{ amount, transactionDate, categoryId?, externalRefId? }`
- Optional defaults: `type`, `status`, `currencyCode`, `recurring`, `recurringInterval`, `description`

### CreateLedgerEntryDto

- `accountId`
- `creatorId`
- `entryType` ('income' | 'expense')
- `amount`
- `balanceAfter` (auto-calculated)
- `description` (optional)
- `transactionId` (optional)

### ListTransactionsFilterDto

- `page`, `pageSize`
- `sortBy` (`transactionDate`, `createdAt`, `updatedAt`, `amount`, `type`, `status`)
- `sortOrder` (`ASC | DESC`)
- Filters: `categoryId`, `type`, `status`, `creatorUserId`, `from`, `to`

---

## Business Logic

1. **Ledger Entries**
   - Immutable records of account movements.
   - Created for every transaction create/update/delete.

2. **Account Balance**
   - Updated in real-time on transaction creation, update, or deletion.
   - Safe arithmetic using `safeAdd` / `safeSubtract`.

3. **Transaction Summaries**
   - Monthly and yearly summaries maintained for optimized statements.
   - Updated via `SummaryWorkerService`.

4. **Recurring Transactions**
   - Can schedule future occurrences.
   - `RecurringTransactionService` handles scheduling logic.
   - Not yet fully hooked into transaction creation.

5. **Optimized Statement**
   - Returns opening balance, transaction list with running balance, and closing balance.
   - Uses summary tables to avoid recalculating entire transaction history.

---

## Notes

- **ExternalRefId** must be unique.
- **Decimal amounts** are stored as strings for precision.
- **Bulk transaction creation** occurs in a single DB transaction.
- **Ledger entries** ensure an immutable history even for updates/deletions.
- **Recurring transactions** feature is planned but not yet fully functional.

---
```
