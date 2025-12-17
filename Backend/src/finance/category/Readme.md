# Categories Module

## Overview

The `Categories` module handles all operations related to **finance categories** for accounts, including creation, updating, deletion, fetching, and listing.
It supports **system-level categories** (global, business, family) and **user-specific categories**, with role- and scope-based access control.

---

## Endpoints

| Method | Route                         | Description                                | Auth Required | Roles / Permissions |
| ------ | ----------------------------- | ------------------------------------------ | ------------- | ------------------- |
| GET    | /finance/categories           | List categories (filterable by type/scope) | ✅            | user/admin          |
| GET    | /finance/categories/:id       | Get a single category by ID                | ✅            | user/admin          |
| POST   | /finance/categories           | Create a new category                      | ✅            | user/admin          |
| PATCH  | /finance/categories/:id       | Update an existing category                | ✅            | user/admin          |
| DELETE | /finance/categories/:id       | Delete a category                          | ✅            | user/admin          |
| GET    | /finance/categories/stats/all | Get category statistics/status             | ✅            | user/admin          |

---

## Business Logic / Rules

- **Validation Rules**
  - Category names must be unique per user and scope.
  - Only user-specific categories can be updated or deleted.
  - System categories (`GLOBAL`, `BUSINESS`, `FAMILY`) cannot be modified.

- **Access Control**
  - Individual categories are readable and writable only by the owning user.
  - System categories are read-only for all users.

- **Special Workflows**
  - Category statistics endpoint aggregates counts by type and owner (system/user).
  - Duplicate name checks prevent conflicting category creation.

- **Edge Cases**
  - Attempting to modify or delete a system category throws a `BadRequestException`.
  - Accessing a category without permission throws a `BadRequestException`.
  - Missing category results in a `NotFoundException`.

---

## Entities / Relationships

| Entity   | Relation Type | Notes                                                |
| -------- | ------------- | ---------------------------------------------------- |
| Category | ManyToOne     | Optional relation to `User` (user-specific category) |

**Category Fields**

| Field       | Type                                           | Notes                                  |
| ----------- | ---------------------------------------------- | -------------------------------------- |
| id          | number                                         | Primary key                            |
| userId      | number (nullable)                              | FK to User, null for system categories |
| user        | User (nullable)                                | Many-to-one relation to User           |
| name        | string                                         | Category name (unique per user/scope)  |
| displayName | string (nullable)                              | Optional display name                  |
| type        | enum (INCOME / EXPENSE)                        | Category type                          |
| scope       | enum (GLOBAL / BUSINESS / FAMILY / INDIVIDUAL) | Scope of category                      |
| createdAt   | timestamp                                      | Created timestamp                      |
| updatedAt   | timestamp                                      | Last updated timestamp                 |

---

## DTOs (Data Transfer Objects)

| DTO Name          | Purpose                                   |
| ----------------- | ----------------------------------------- |
| CreateCategoryDto | Data for creating a new category          |
| UpdateCategoryDto | Data for updating an existing category    |
| FilterCategoryDto | Optional filters for listing categories   |
| CategoryStatsDto  | Structure of category statistics response |

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

---

## Notes

- The **CategoryValidator** is exposed so other modules can **validate categories** before using them.
- Categories can be **seeded** with default system data via the `categories:seed` command.
