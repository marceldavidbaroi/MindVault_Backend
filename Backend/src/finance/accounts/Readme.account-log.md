# Account Logs Module

## Overview

Handles all operations related to **account logs**, including recording changes to accounts, tracking balance updates, and logging create/update/delete operations.
Anyone with access to the account or a member of the account can view the logs.

---

## Endpoints

| Method | Route                     | Description                    | Auth Required | Roles / Permissions                 |
| ------ | ------------------------- | ------------------------------ | ------------- | ----------------------------------- |
| GET    | /finance/account-logs     | List all account logs          | ✅            | account members / users with access |
| GET    | /finance/account-logs/:id | Get a single account log by ID | ✅            | account members / users with access |

> 🔹 Pagination, filtering by `action`, and ordering (`asc` / `desc`) are supported in the list endpoint.

---

## Business Logic / Rules

- **Access:** Only users who have access to the account or are members of the account can view the logs.
- **Logging:** Each log records the following:
  - The **user** who made the change
  - The **action** (`create`, `update`, `delete`, `balance_change`)
  - **Old values** and **new values** in JSON format
  - **Balance changes** optionally linked to a transaction ID or service ID for automated updates

- **Relations:** All entity relationships can be fetched optionally via query parameters. If no relations are requested, raw log data is returned.
- **Pagination & Ordering:** List endpoint supports `page`, `limit`, and `order` query parameters. Default: `page=1`, `limit=20`, `order=DESC`.
- **Balance Changes:** Balance can be **added/subtracted** or **set directly** via balance update endpoint. Current balance is always returned.
- **Cascade Delete:** Related logs are automatically deleted if the corresponding account is deleted.

---

## Entities / Relationships

| Entity      | Relation Type        | Notes                                                               |
| ----------- | -------------------- | ------------------------------------------------------------------- |
| AccountLog  | ManyToOne            | Each log belongs to a single account                                |
| User        | ManyToOne            | The user who performed the action                                   |
| Transaction | ManyToOne (optional) | For automated balance changes, links to a transaction or service ID |
| Account     | ManyToOne            | The account for which the log is created                            |

---

## DTOs (Data Transfer Objects)

| DTO Name                  | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| ListAccountLogsQueryDto   | Query parameters for pagination, filtering, and ordering   |
| AccountLogResponseDto     | Standard response format for a single log                  |
| AccountLogListResponseDto | Standard response format for a list of logs with meta info |

---

## Standard Response Format

All endpoints return:

```ts
{
  success: boolean,
  message: string,
  data: any | null,
  error?: string | string[],
  meta?: {
    page?: number,
    limit?: number,
    total?: number
  }
}
```

- **Pagination Example**:

```ts
{
  success: true,
  message: 'Account logs fetched',
  data: [...],
  meta: {
    page: 1,
    limit: 20,
    total: 150
  }
}
```
