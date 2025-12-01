# Finance Module – Entity Definitions

This document defines all the entities for the **Finance Module**, including fields, types, and relationships.

---

## 1. Category Entity

**Purpose:** Transaction classification (income/expense) for users or globally.

| Field       | Type        | Constraints                    | Description                            |
| ----------- | ----------- | ------------------------------ | -------------------------------------- |
| id          | PK          | Auto-increment                 | Unique category ID                     |
| userId      | FK → User   | Nullable                       | Owner of the category; null for global |
| name        | varchar(50) | Required                       | Category name                          |
| displayName | varchar(50) | Optional                       | Display name for UI                    |
| type        | enum        | ['income','expense'], Required | Transaction type                       |
| createdAt   | timestamp   | Auto-generated                 | Creation timestamp                     |
| updatedAt   | timestamp   | Auto-generated                 | Last updated                           |

**Relations:**

- `userId` → User (nullable)
- One-to-many: `Transaction`

---

## 2. AccountType Entity

**Purpose:** Define types of accounts (personal, business, group, goal).

| Field         | Type        | Constraints      | Description                       |
| ------------- | ----------- | ---------------- | --------------------------------- |
| id            | PK          | Auto-increment   | Unique account type ID            |
| creatorUserId | FK → User   | Nullable         | User who created this type        |
| name          | varchar(50) | Required, unique | Name of the account type          |
| slug          | varchar(50) | Required, unique | Slug for URL / identifier         |
| isGroup       | boolean     | Default false    | True if this type supports groups |
| isGoal        | boolean     | Default false    | True if this type is a goal       |
| description   | text        | Optional         | Description of the account type   |
| isActive      | boolean     | Default true     | Account type active status        |
| createdAt     | timestamp   | Auto-generated   | Creation timestamp                |
| updatedAt     | timestamp   | Auto-generated   | Last updated                      |

**Relations:**

- One-to-many: `Account`

---

## 3. Account Entity

**Purpose:** Represent individual or shared accounts.

| Field         | Type             | Constraints                                     | Description             |
| ------------- | ---------------- | ----------------------------------------------- | ----------------------- |
| id            | PK               | Auto-increment                                  | Unique account ID       |
| accountTypeId | FK → AccountType | Required                                        | Type of account         |
| name          | varchar(50)      | Required                                        | Account name            |
| description   | text             | Optional                                        | Description             |
| balance       | decimal(18,2)    | Default 0                                       | Current account balance |
| currencyCode  | FK → Currency    | Required                                        | Currency of the account |
| status        | enum             | ['active','dormant','closed'], Default 'active' | Account status          |
| createdAt     | timestamp        | Auto-generated                                  | Creation timestamp      |
| updatedAt     | timestamp        | Auto-generated                                  | Last updated            |

**Relations:**

- Many-to-one: `AccountType`
- Many-to-one: `Currency`
- One-to-many: `Transaction`
- One-to-many: `AccountUserRole`

---

## 4. AccountUserRole Entity

**Purpose:** Map users to shared accounts with roles.

| Field     | Type          | Constraints    | Description              |
| --------- | ------------- | -------------- | ------------------------ |
| id        | PK            | Auto-increment | Unique ID                |
| accountId | FK → Account  | Required       | Account being assigned   |
| userId    | FK → User     | Required       | User assigned to account |
| roleId    | FK → UserRole | Required       | Role assigned            |
| createdAt | timestamp     | Auto-generated | Creation timestamp       |
| updatedAt | timestamp     | Auto-generated | Last updated             |

**Constraints:**

- Unique `(accountId, userId)`

**Relations:**

- Many-to-one: `Account`
- Many-to-one: `User`
- Many-to-one: `UserRole`

---

## 5. Transaction Entity

**Purpose:** Ledger entries for income/expense.

| Field             | Type          | Constraints                                              | Description                  |
| ----------------- | ------------- | -------------------------------------------------------- | ---------------------------- |
| id                | PK            | Auto-increment                                           | Unique transaction ID        |
| accountId         | FK → Account  | Required                                                 | Account for this transaction |
| creatorUserId     | FK → User     | Required                                                 | Creator of transaction       |
| categoryId        | FK → Category | Nullable                                                 | Category of transaction      |
| type              | enum          | ['income','expense'], Required                           | Transaction type             |
| amount            | decimal(18,2) | Required                                                 | Transaction amount           |
| currencyCode      | FK → Currency | Nullable                                                 | Currency of transaction      |
| transactionDate   | date          | Required                                                 | Date of transaction          |
| description       | text          | Optional                                                 | Notes                        |
| status            | enum          | ['pending','cleared','void','failed'], Default 'pending' | Transaction status           |
| externalRefId     | varchar(50)   | Optional, unique                                         | External reference           |
| recurring         | boolean       | Default false                                            | If transaction is recurring  |
| recurringInterval | enum          | ['daily','weekly','monthly','yearly'], Nullable          | Recurring interval if any    |
| createdAt         | timestamp     | Auto-generated                                           | Creation timestamp           |
| updatedAt         | timestamp     | Auto-generated                                           | Last updated                 |

**Relations:**

- Many-to-one: `Account`
- Many-to-one: `User`
- Many-to-one: `Category`
- Many-to-one: `Currency`
- One-to-one: `RecurringTransactionSchedule` (optional)
- One-to-many: `AccountLedger`

---

## 6. RecurringTransactionSchedule Entity

**Purpose:** Track next occurrence of recurring transactions.

| Field              | Type             | Constraints                           | Description                 |
| ------------------ | ---------------- | ------------------------------------- | --------------------------- |
| id                 | PK               | Auto-increment                        | Unique ID                   |
| transactionId      | FK → Transaction | Required                              | Transaction being scheduled |
| nextOccurrenceDate | date             | Required                              | Next scheduled date         |
| interval           | enum             | ['daily','weekly','monthly','yearly'] | Recurrence interval         |
| isActive           | boolean          | Default true                          | If recurrence is active     |
| createdAt          | timestamp        | Auto-generated                        | Creation timestamp          |
| updatedAt          | timestamp        | Auto-generated                        | Last updated                |

**Relations:**

- Many-to-one: `Transaction`

---

## 7. Summary Entities

### DailySummary

| Field        | Type          | Constraints    | Description               |
| ------------ | ------------- | -------------- | ------------------------- |
| id           | PK            | Auto-increment | Unique ID                 |
| userId       | FK → User     | Required       | User associated           |
| date         | date          | Required       | Date of summary           |
| totalIncome  | decimal(18,2) | Default 0      | Total income for the day  |
| totalExpense | decimal(18,2) | Default 0      | Total expense for the day |

**Relations:**

- Many-to-one: `User`

### MonthlySummary

| Field        | Type          | Constraints    | Description             |
| ------------ | ------------- | -------------- | ----------------------- |
| id           | PK            | Auto-increment | Unique ID               |
| userId       | FK → User     | Required       | User associated         |
| year         | int           | Required       | Year                    |
| month        | int           | Required       | Month                   |
| totalIncome  | decimal(18,2) | Default 0      | Total income for month  |
| totalExpense | decimal(18,2) | Default 0      | Total expense for month |

**Relations:**

- Many-to-one: `User`

### MonthlyCategorySummary

| Field       | Type          | Constraints          | Description                     |
| ----------- | ------------- | -------------------- | ------------------------------- |
| id          | PK            | Auto-increment       | Unique ID                       |
| userId      | FK → User     | Required             | User associated                 |
| year        | int           | Required             | Year                            |
| month       | int           | Required             | Month                           |
| categoryId  | FK → Category | Required             | Category                        |
| type        | enum          | ['income','expense'] | Type of transaction             |
| totalAmount | decimal(18,2) | Default 0            | Total amount for category/month |

**Relations:**

- Many-to-one: `User`
- Many-to-one: `Category`

---

## 8. AccountLedger Entity

**Purpose:** Immutable ledger entries for transactions.

| Field         | Type             | Constraints    | Description                       |
| ------------- | ---------------- | -------------- | --------------------------------- |
| id            | PK               | Auto-increment | Unique ID                         |
| transactionId | FK → Transaction | Required       | Associated transaction            |
| accountId     | FK → Account     | Required       | Account affected                  |
| amount        | decimal(18,2)    | Required       | Transaction amount                |
| balanceAfter  | decimal(18,2)    | Required       | Account balance after transaction |
| createdAt     | timestamp        | Auto-generated | Creation timestamp                |

**Relations:**

- Many-to-one: `Transaction`
- Many-to-one: `Account`

---

## 9. AuditLog Entity

**Purpose:** Track changes to accounts/transactions/entities.

| Field      | Type        | Constraints    | Description                                 |
| ---------- | ----------- | -------------- | ------------------------------------------- |
| id         | PK          | Auto-increment | Unique ID                                   |
| entityType | varchar(50) | Required       | Type of entity (Transaction, Account, etc.) |
| entityId   | int         | Required       | ID of entity changed                        |
| action     | varchar(50) | Required       | Action performed (create/update/delete)     |
| userId     | FK → User   | Nullable       | User performing the action                  |
| payload    | JSON        | Optional       | Payload of change                           |
| createdAt  | timestamp   | Auto-generated | Timestamp                                   |

**Relations:**

- Many-to-one: `User` (nullable)

---

## 10. Payroll / PaySlip Entity

**Purpose:** Track employee payments.

| Field       | Type          | Constraints        | Description                |
| ----------- | ------------- | ------------------ | -------------------------- |
| id          | PK            | Auto-increment     | Unique ID                  |
| userId      | FK → User     | Required           | Employee receiving payroll |
| accountId   | FK → Account  | Required           | Account used for payment   |
| periodStart | date          | Required           | Payroll period start       |
| periodEnd   | date          | Required           | Payroll period end         |
| grossAmount | decimal(18,2) | Required           | Gross salary               |
| deductions  | decimal(18,2) | Default 0          | Deductions (taxes, etc.)   |
| netAmount   | decimal(18,2) | Required           | Net salary paid            |
| status      | enum          | ['pending','paid'] | Payroll status             |
| createdAt   | timestamp     | Auto-generated     | Creation timestamp         |
| updatedAt   | timestamp     | Auto-generated     | Last updated               |

**Relations:**

- Many-to-one: `User`
- Many-to-one: `Account`

---

## 11. Currency Entity

| Field     | Type          | Constraints    | Description                    |
| --------- | ------------- | -------------- | ------------------------------ |
| code      | PK varchar(3) | Required       | Currency code (USD, EUR, etc.) |
| name      | varchar(50)   | Required       | Currency name                  |
| symbol    | varchar(5)    | Required       | Symbol ($, €, etc.)            |
| decimal   | int           | Default 2      | Number of decimal places       |
| isActive  | boolean       | Default true   | Currency active status         |
| createdAt | timestamp     | Auto-generated | Creation timestamp             |
| updatedAt | timestamp     | Auto-generated | Last updated                   |

**Relations:**

- One-to-many: `Account`, `Transaction`

---

## 12. ExchangeRate Entity

| Field        | Type          | Constraints    | Description        |
| ------------ | ------------- | -------------- | ------------------ |
| id           | PK            | Auto-increment | Unique ID          |
| fromCurrency | FK → Currency | Required       | Source currency    |
| toCurrency   | FK → Currency | Required       | Target currency    |
| rate         | decimal(18,6) | Required       | Conversion rate    |
| date         | date          | Required       | Date of the rate   |
| createdAt    | timestamp     | Auto-generated | Creation timestamp |

**Relations:**

- Many-to-one: `Currency` (fromCurrency)
- Many-to-one: `Currency` (toCurrency)

---
