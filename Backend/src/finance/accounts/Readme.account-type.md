# AccountTypes Module

## Overview

The `AccountTypes` module handles all operations related to **account types** in the finance system.
It supports **listing active account types**, validating existence, and managing default system account types via seeding.
This module provides a **layered architecture** with repository, service, validator, and transformer for consistent handling across the app.

---

## Endpoints

| Method | Route                  | Description                   | Auth Required | Roles / Permissions |
| ------ | ---------------------- | ----------------------------- | ------------- | ------------------- |
| GET    | /finance/account-types | List all active account types | ✅            | user/admin          |

> ⚠️ Currently, account types are read-only; creation, update, and delete are handled only via seeding.

---

## Business Logic / Rules

- **Validation Rules**
  - Only active account types are listed.
  - Existence of an account type is validated before use.

- **Access Control**
  - Both endpoints require authentication.

- **Special Workflows**
  - Default account types are seeded using `account-type:seed`.

- **Edge Cases**
  - Attempting to access a non-existent account type throws `NotFoundException`.

---

## Entities / Relationships

| Entity      | Relation Type | Notes                                        |
| ----------- | ------------- | -------------------------------------------- |
| AccountType | OneToMany     | Can be linked to multiple `Account` entities |

**AccountType Fields**

| Field       | Type                                         | Notes                                     |
| ----------- | -------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| id          | number                                       | Primary key                               |
| name        | string                                       | Type of account (e.g., Savings, Checking) |
| description | string                                       | null                                      | Optional description of account type |
| isActive    | boolean                                      | Whether account type is active            |
| scope       | enum (PERSONAL / BUSINESS / FAMILY / SHARED) | Scope of account type                     |
| createdAt   | timestamp                                    | Created timestamp                         |
| updatedAt   | timestamp                                    | Last updated timestamp                    |

---

## DTOs (Data Transfer Objects)

| DTO Name               | Purpose                                 |
| ---------------------- | --------------------------------------- |
| AccountTypeResponseDto | Formats account type data for responses |

> ⚠️ Currently, creation/updating is handled via seeding; no user-facing DTOs for modification.

---

## Standard Response Format

All endpoints return:

```ts
{
  success: boolean,
  message: string,
  data: any
}
```

Example:

```ts
{
  success: true,
  message: 'Account types fetched successfully',
  data: [
    { id: 1, name: 'Savings', description: 'A savings account', isActive: true, scope: 'personal' },
    { id: 2, name: 'Checking', description: 'Main checking account', isActive: true, scope: 'personal' }
  ]
}
```

---

## Seeder

- **Command:** `account-type:seed`
- **Purpose:** Inserts default system account types into the database.
- **Behavior:**
  - Clears the `account_types` table (`TRUNCATE ... CASCADE`)
  - Bulk inserts default account types from `defaultAccountTypes`
  - Uses `AccountTypeRepository.saveMany()` for efficiency

---

## Notes

- **Validator** (`AccountTypeValidator`) ensures the existence of an account type for other modules.
- **Transformer** (`AccountTypeTransformer`) formats responses consistently.
- The module is **read-only via API**, with modification handled via seed data for system consistency.
