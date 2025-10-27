## 🎯 Refactor Plan: Multi-Entity Transaction System

This plan outlines the necessary database schema changes to transform the current user-centric model into a robust, scalable system that supports **Personal, Family, and Business** financial management through the introduction of **Financial Accounts** and detailed **User Roles**.

---

## I. Core Architectural Changes

The primary goal is to shift the **1:N** relationship from **Users → Transactions** to **Accounts → Transactions**.

| Old Relationship                 | New Relationship                    | Rationale                                                              |
| :------------------------------- | :---------------------------------- | :--------------------------------------------------------------------- |
| **Users (1) → Transactions (N)** | **Accounts (1) → Transactions (N)** | Transactions belong to a pool of money (**Account**), not just a user. |
| (Implicit **1:1** User–Account)  | **Users (M) ↔ Accounts (N)**        | Allows **joint/shared accounts** (Family/Business).                    |
| **Transactions.user_id**         | **Transactions.account_id**         | **Decouples** the transaction record from the owner.                   |

---

## II. New Tables to Be Added

### 1. Accounts 🏦 (Enhanced)

Added fields for **Currency** (essential for global scalability) and **Status** (for managing dormant/closed accounts).

| Column Name       | Type            | Key/Index         | Description                                                     |
| :---------------- | :-------------- | :---------------- | :-------------------------------------------------------------- |
| **id**            | `INT`           | Primary Key       | Unique Account/Entity ID.                                       |
| **owner_user_id** | `INT`           | Index, FK → Users | The initial creator/primary administrator of the account.       |
| **name**          | `VARCHAR(100)`  |                   | User-defined name (e.g., “Joint Checking”, “Marketing Budget”). |
| **description**   | `TEXT`          |                   | Optional notes about the account/entity.                        |
| **type**          | `ENUM`          |                   | 'personal', 'joint', 'business', 'savings_goal', etc.           |
| **balance**       | `DECIMAL(18,2)` |                   | Current balance (Maintained by summary logic/trigger).          |
| **currency_code** | `VARCHAR(3)`    | Index             | **NEW**: ISO 4217 Currency Code (e.g., “USD”, “EUR”).           |
| **status**        | `ENUM`          |                   | **NEW**: 'active', 'dormant', 'closed'.                         |
| **created_at**    | `TIMESTAMP`     |                   |                                                                 |

---

### 2. UserAccounts 🤝 (Enhanced for Audit and Control)

Added **is_active** and **updated_at** to manage role assignment lifecycle (e.g., when an admin revokes a user's access).

| Column Name             | Type                      | Key/Index         | Description                                               |
| :---------------------- | :------------------------ | :---------------- | :-------------------------------------------------------- |
| **user_id**             | `INT`                     | PK, FK → Users    | The user granted access.                                  |
| **account_id**          | `INT`                     | PK, FK → Accounts | The account the user has access to.                       |
| **role**                | `ENUM`                    |                   | Defines permission: 'owner', 'admin', 'editor', 'viewer'. |
| **assigned_by_user_id** | `INT`                     | FK → Users        | Audit trail: who assigned this role/access.               |
| **is_active**           | `BOOLEAN`                 |                   | **NEW**: Status of the role assignment (True/False).      |
| **created_at**          | `TIMESTAMP`               |                   | When assigned.                                            |
| **updated_at**          | `TIMESTAMP`               |                   | **NEW**: When the role or status last changed.            |
| **Composite PK**        | (`user_id`, `account_id`) |                   | Combined primary key.                                     |

---

## III. Modified Core Tables

### 1. Transactions (Enhanced for Reconciliation)

Added fields to track transaction lifecycle and bank linkage.

| Column Name         | Action         | Key/Index              | Description                                                      |
| :------------------ | :------------- | :--------------------- | :--------------------------------------------------------------- |
| **user_id**         | **DROP**       | -                      | Removed direct link to user.                                     |
| **account_id**      | **ADD**        | Index, FK → Accounts   | The financial pool this transaction affects.                     |
| **creator_user_id** | **ADD**        | Index, FK → Users      | Audit: The user who logged this transaction.                     |
| **status**          | `ENUM`         |                        | **NEW**: 'pending', 'cleared', 'void' (for bank reconciliation). |
| **external_ref_id** | `VARCHAR(100)` | Index (Partial)        | **NEW**: Bank transaction or payment processor reference number. |
| **category_id**     | Retain         | Index, FK → Categories | (From previous schema update).                                   |

---

### 2. Budgets (No Change Needed)

The current structure (`month`, `year`, `account_id`, `category_id`) is sufficient for budgeting.

---

### 3. SavingsGoals (Removed)

Folded into the **Accounts** table where `type = 'savings_goal'`.

---

### 4. Categories (No Change)

No structural change.

---

## IV. Impact on Summary Tables

All summary tables now aggregate by **account_id** instead of **user_id**.

### 1. daily_summary

| Column Name    | Action   | Description      |
| :------------- | :------- | :--------------- |
| **user_id**    | **DROP** | Removed.         |
| **account_id** | **ADD**  | Aggregation key. |

---

### 2. monthly_summary

| Column Name    | Action   | Description      |
| :------------- | :------- | :--------------- |
| **user_id**    | **DROP** | Removed.         |
| **account_id** | **ADD**  | Aggregation key. |

---

### 3. category_monthly_summary

| Column Name    | Action   | Description      |
| :------------- | :------- | :--------------- |
| **user_id**    | **DROP** | Removed.         |
| **account_id** | **ADD**  | Aggregation key. |
