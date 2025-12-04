# Finance Accounts Module

This module handles **user accounts, account types, user roles, balances, and ownership transfer** for the finance system. It integrates with the authentication, roles, and currency modules.

---

## Table of Contents

- [Entities](#entities)
- [DTOs](#dtos)
- [Services](#services)
- [Controllers & Endpoints](#controllers--endpoints)
- [Roles & Permissions](#roles--permissions)
- [Seeder](#seeder)
- [Balance Management](#balance-management)

---

## Entities

### AccountType

Represents different types of accounts in the system.

| Field       | Type           | Description                         |
| ----------- | -------------- | ----------------------------------- | ------ | ------- | ------------------------- |
| id          | number         | Unique identifier                   |
| name        | string         | Name of account type                |
| description | string \| null | Description of account type         |
| isActive    | boolean        | Whether this account type is active |
| scope       | enum `personal | business                            | family | shared` | Scope of the account type |
| createdAt   | Date           | Timestamp of creation               |
| updatedAt   | Date           | Timestamp of last update            |
| accounts    | Account[]      | One-to-many relation to accounts    |

---

### Account

Represents a financial account.

| Field          | Type              | Description                    |
| -------------- | ----------------- | ------------------------------ |
| id             | number            | Unique identifier              |
| name           | string            | Account display name           |
| description    | string \| null    | Account description            |
| initialBalance | string            | Starting balance               |
| balance        | string            | Current balance                |
| type           | AccountType       | Account type relation          |
| ownerId        | number            | ID of the account owner        |
| currency       | Currency          | Associated currency            |
| owner          | User              | Owner user relation            |
| userRoles      | AccountUserRole[] | Users assigned to this account |
| createdAt      | Date              | Timestamp of creation          |
| updatedAt      | Date              | Timestamp of last update       |

---

### AccountUserRole

Maps **users to accounts with roles**.

| Field     | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| id        | number  | Unique identifier                |
| account   | Account | Associated account               |
| user      | User    | Assigned user                    |
| role      | Role    | Role of the user for the account |
| createdAt | Date    | Timestamp of creation            |
| updatedAt | Date    | Timestamp of last update         |

**Constraints:** `Unique(account, user)` – a user can only have one role per account.

---

## DTOs

### CreateAccountDto

| Field           | Type   | Description                   |
| --------------- | ------ | ----------------------------- |
| name            | string | Account name                  |
| description?    | string | Optional description          |
| initialBalance? | number | Optional initial balance      |
| accountTypeId   | number | Type of the account           |
| currencyCode    | string | Currency code for the account |

---

### UpdateAccountDto

| Field          | Type   | Description                      |
| -------------- | ------ | -------------------------------- |
| name?          | string | Optional updated name            |
| description?   | string | Optional updated description     |
| accountTypeId? | number | Optional updated account type ID |
| currencyCode?  | string | Optional updated currency code   |

---

### AssignRoleDto

| Field    | Type   | Description                 |
| -------- | ------ | --------------------------- |
| username | string | Username to assign the role |
| roleId   | number | Role ID to assign           |

---

### UpdateRoleDto

| Field  | Type   | Description              |
| ------ | ------ | ------------------------ |
| roleId | number | New role ID for the user |

---

### AccountUserRoleDto

| Field     | Type        | Description                                              |
| --------- | ----------- | -------------------------------------------------------- |
| id        | number      | Role mapping ID                                          |
| accountId | number      | Associated account ID                                    |
| userId    | number      | Assigned user ID                                         |
| user      | SafeUserDto | Basic user info (id, username, email)                    |
| role      | object      | Role info (`id`, `name`, `displayName?`, `description?`) |
| createdAt | Date        | Timestamp of creation                                    |
| updatedAt | Date        | Timestamp of last update                                 |

---

## Services

### AccountsService

- Create, update, delete accounts
- Fetch accounts for a user
- Update/get account balance
- Ensure **owner/admin permission checks** on update/delete

### AccountTypesService

- List all **active account types**
- Used when creating or updating accounts

### AccountUserRolesService

- Assign roles to users
- Update user roles
- Remove user roles
- Fetch **user role for an account**
- Transfer account ownership
- Fetch all accounts with roles for a user

---

## Controllers & Endpoints

All endpoints are under `/finance/accounts` and **require JWT auth**.

### Account CRUD

| Method | Endpoint | Description                   |
| ------ | -------- | ----------------------------- |
| POST   | `/`      | Create new account            |
| GET    | `/my`    | List accounts of current user |
| GET    | `/:id`   | Get a single account          |
| PUT    | `/:id`   | Update account                |
| DELETE | `/:id`   | Delete account                |

### Account Types

| Method | Endpoint     | Description                   |
| ------ | ------------ | ----------------------------- |
| GET    | `/types/all` | List all active account types |

### Account Roles

| Method | Endpoint                              | Description                   |
| ------ | ------------------------------------- | ----------------------------- |
| POST   | `/:id/roles`                          | Assign role to a user         |
| PUT    | `/:id/roles/:userId`                  | Update a user role            |
| DELETE | `/:id/roles/:userId`                  | Remove a user role            |
| GET    | `/:id/roles`                          | List all roles for an account |
| GET    | `/:id/role`                           | Get current user's role       |
| POST   | `/:id/transfer-ownership/:newOwnerId` | Transfer account ownership    |

---

## Roles & Permissions

| Role   | Permissions                                                                         |
| ------ | ----------------------------------------------------------------------------------- |
| Owner  | Full control, can assign roles, transfer ownership, delete account                  |
| Admin  | Can assign roles (except Owner), update account details, remove editor/viewer roles |
| Editor | Limited permissions, can update content but not roles                               |
| Viewer | Read-only access                                                                    |

**Rules:**

- Only **owner/admin** can update accounts
- Owner cannot remove their own role unless transferring ownership
- Cannot assign Owner role via `assignRole` endpoint

---

## Seeder

### AccountTypeSeeder

- Seeds default account types from `defaultAccountTypes`
- Command:

```bash
npm run command account-type:seed
```
