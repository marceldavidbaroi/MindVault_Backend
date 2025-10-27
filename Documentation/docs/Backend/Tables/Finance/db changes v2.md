## 🎯 Refactor Plan: Multi-Entity Transaction System

This plan outlines the necessary database schema changes to transform the current user-centric model into a robust, scalable system that supports **Personal, Family, and Business** financial management through the introduction of **Financial Accounts** and detailed **User Roles**.

---

## I. Core Architectural Changes

The primary goal is to shift the **1:N** relationship from $\text{Users} \rightarrow \text{Transactions}$ to $\text{Accounts} \rightarrow \text{Transactions}$.

| Old Relationship                                       | New Relationship                                          | Rationale                                                              |
| :----------------------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------- |
| $\text{Users (1)} \rightarrow \text{Transactions (N)}$ | $\text{Accounts (1)} \rightarrow \text{Transactions (N)}$ | Transactions belong to a pool of money (**Account**), not just a user. |
| (Implicit $\text{1:1}$ User-Account)                   | $\text{Users (M)} \leftrightarrow \text{Accounts (N)}$    | Allows **joint/shared accounts** (Family/Business).                    |
| $\text{Transactions.user\_id}$                         | $\text{Transactions.account\_id}$                         | **Decouples** the transaction record from the owner.                   |

---

## II. New Tables to Be Added

### 1. Accounts 🏦 (Enhanced)

Added fields for **Currency** (essential for global scalability) and **Status** (for managing dormant/closed accounts).

| Column Name       | Type             | Key/Index                     | Description                                                     |
| :---------------- | :--------------- | :---------------------------- | :-------------------------------------------------------------- |
| **id**            | `INT`            | Primary Key                   | Unique Account/Entity ID.                                       |
| **owner_user_id** | `INT`            | Index, FK $\rightarrow$ Users | The initial creator/primary administrator of the account.       |
| **name**          | `VARCHAR(100)`   |                               | User-defined name (e.g., 'Joint Checking', 'Marketing Budget'). |
| **description**   | `TEXT`           |                               | Optional notes about the account/entity.                        |
| **type**          | `ENUM`           |                               | 'personal', 'joint', 'business', 'savings_goal', etc.           |
| **balance**       | `DECIMAL(18, 2)` |                               | Current balance (Maintained by summary logic/trigger).          |
| **currency_code** | `VARCHAR(3)`     | Index                         | **NEW**: ISO 4217 Currency Code (e.g., 'USD', 'EUR').           |
| **status**        | `ENUM`           |                               | **NEW**: 'active', 'dormant', 'closed'.                         |
| **created_at**    | `TIMESTAMP`      |                               |                                                                 |

---

### 2. UserAccounts 🤝 (Enhanced for Audit and Control)

Added **is_active** and **updated_at** to manage role assignment lifecycle (e.g., when an admin revokes a user's access).

| Column Name                                          | Type        | Key/Index                                                 | Description                                                         |
| :--------------------------------------------------- | :---------- | :-------------------------------------------------------- | :------------------------------------------------------------------ |
| **user_id**                                          | `INT`       | Part of PK, FK $\rightarrow$ Users                        | The user granted access.                                            |
| **account_id**                                       | `INT`       | Part of PK, FK $\rightarrow$ Accounts                     | The account the user has access to.                                 |
| **role**                                             | `ENUM`      |                                                           | Defines permission level: **'owner', 'admin', 'editor', 'viewer'**. |
| **assigned_by_user_id**                              | `INT`       | Index, FK $\rightarrow$ Users                             | **Audit Trail**: The user who assigned this role/access.            |
| **is_active**                                        | `BOOLEAN`   | **NEW**: Status of the role assignment (True/False).      |
| **created_at**                                       | `TIMESTAMP` |                                                           |                                                                     |
| **updated_at**                                       | `TIMESTAMP` | **NEW**: When the role or active status was last changed. |
| **Composite Primary Key:** (`user_id`, `account_id`) |             |                                                           |                                                                     |

---

## III. Modified Core Tables

### 1. Transactions Table (Enhanced for Reconciliation)

Added fields to track the lifecycle of a transaction (e.g., pending vs. cleared) and to link it back to external bank data.

| Column Name         | Action         | New Key/Index                      | Description                                                             |
| :------------------ | :------------- | :--------------------------------- | :---------------------------------------------------------------------- |
| **user_id**         | **DROP**       | -                                  | Removed direct link to user.                                            |
| **account_id**      | **ADD**        | Index, FK $\rightarrow$ Accounts   | The financial pool this transaction affects.                            |
| **creator_user_id** | **ADD**        | Index, FK $\rightarrow$ Users      | **Audit Trail**: The user who logged this transaction.                  |
| **status**          | `ENUM`         |                                    | **NEW**: 'pending', 'cleared', 'void'. Crucial for bank reconciliation. |
| **external_ref_id** | `VARCHAR(100)` | Index (Partial)                    | **NEW**: Bank transaction ID or payment processor reference number.     |
| **category_id**     | Retain         | Index, FK $\rightarrow$ Categories | (From previous schema update).                                          |

---

### 2. Budgets Table (No Change Needed)

The current structure (`month`, `year`, `account\_id`, `category\_id`) is sufficient for robust month-by-month budgeting.

---

### 3. SavingsGoals Table (REMOVED)

As agreed, this functionality is folded into the **Accounts** table where `type` = 'savings_goal'.

---

### 4. Categories Table (No Change to Structure)

The structure remains the same.

---

## IV. Impact on Summary Tables

All summary tables now aggregate by **`account_id`**.

### 1. daily_summary (No Structural Change)

| Column Name    | Action   | Description      |
| :------------- | :------- | :--------------- |
| **user_id**    | **DROP** |                  |
| **account_id** | **ADD**  | Aggregation key. |

---

### 2. monthly_summary (No Structural Change)

| Column Name    | Action   | Description      |
| :------------- | :------- | :--------------- |
| **user_id**    | **DROP** |                  |
| **account_id** | **ADD**  | Aggregation key. |

---

### 3. category_monthly_summary (No Structural Change)

| Column Name    | Action   | Description      |
| :------------- | :------- | :--------------- |
| **user_id**    | **DROP** |                  |
| **account_id** | **ADD**  | Aggregation key. |
