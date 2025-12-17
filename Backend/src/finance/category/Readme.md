Here’s a **Markdown README** for your **Finance Categories module**, structured for clarity and developer reference:

````markdown
# Finance Categories Module

This module manages **income and expense categories** for a finance system. It supports **system-wide, business, family, and individual categories**, along with **CRUD operations, filtering, and statistics**.

All endpoints require **JWT authentication**.

---

## Table of Contents

- [Entities](#entities)
- [DTOs](#dtos)
- [Controllers & Endpoints](#controllers--endpoints)
- [Services](#services)
- [Seeder](#seeder)
- [Category Stats](#category-stats)
- [Permissions & Scope](#permissions--scope)

---

## Entities

### Category

Represents a financial category.

| Field                  | Type                                               | Description                                    |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------- |
| id                     | number                                             | Unique identifier                              |
| user?                  | User                                               | Optional owner; only for individual categories |
| name                   | string                                             | Category name                                  |
| displayName?           | string                                             | Optional display name                          |
| type                   | `income` \| `expense`                              | Type of category                               |
| scope                  | `global` \| `business` \| `family` \| `individual` | Category scope                                 |
| createdAt              | Date                                               | Timestamp of creation                          |
| updatedAt              | Date                                               | Timestamp of last update                       |
| transactions           | Transaction[]                                      | Related transactions                           |
| monthlyCategorySummary | MonthlyCategorySummary[]                           | Monthly category summaries                     |
| dailyCategorySummaries | DailyCategorySummary[]                             | Daily category summaries                       |

**Indexes & Constraints:**

- `@Index(['user', 'name', 'scope'], { unique: true })` ensures a unique name per user and scope.

---

## DTOs

### CreateCategoryDto

| Field        | Type   | Description                           |
| ------------ | ------ | ------------------------------------- |
| name         | string | Category name                         |
| displayName? | string | Optional display name                 |
| type?        | string | Optional type (`income` or `expense`) |

### UpdateCategoryDto

| Field        | Type   | Description                   |
| ------------ | ------ | ----------------------------- |
| name?        | string | Optional updated name         |
| displayName? | string | Optional updated display name |
| type?        | string | Optional updated type         |

### FilterCategoryDto

| Field   | Type                                               | Description                   |
| ------- | -------------------------------------------------- | ----------------------------- |
| type?   | `income` \| `expense`                              | Filter categories by type     |
| search? | string                                             | Search by name or displayName |
| scope?  | `global` \| `business` \| `family` \| `individual` | Filter by scope               |

---

## Controllers & Endpoints

All endpoints are under `/finance/categories`.

| Method | Endpoint     | Description                         | Auth Required |
| ------ | ------------ | ----------------------------------- | ------------- |
| POST   | `/`          | Create a new category               | ✅            |
| PATCH  | `/:id`       | Update a category                   | ✅            |
| DELETE | `/:id`       | Delete a category                   | ✅            |
| GET    | `/:id`       | Get a single category               | ✅            |
| GET    | `/`          | List all categories (system + user) | ✅            |
| GET    | `/stats/all` | Get category statistics             | ✅            |

**Responses:** All endpoints return:

```ts
{
  success: boolean,
  message: string,
  data: any
}
```
````

---

## Services

### CategoriesService

- `createCategory(user, dto)` – Creates a new individual category.
- `updateCategory(id, dto, user)` – Updates an individual category.
- `deleteCategory(id, user)` – Deletes an individual category.
- `getCategory(id, user)` – Fetches a single category.
- `listCategories(user, type?, search?, scope?)` – Lists categories including system-wide + user-specific.
- `verifyCategory(id)` – Ensures the category exists.
- `getCategoryStats(user)` – Returns counts for income/expense categories by system/user.

---

## Seeder

### CategoriesSeeder

Seeds **default categories** into the database.

**Command:**

```bash
npm run command categories:run
```

**Behavior:**

- Truncates the `categories` table
- Inserts all `defaultCategories`
- Logs success/failure

---

## Category Stats

`CategoryStats` interface provides:

```ts
interface CategoryStats {
  total: number;
  income: { total: number; system: number; user: number };
  expense: { total: number; system: number; user: number };
}
```

- `total`: total categories
- `income`: income category count (system vs user)
- `expense`: expense category count (system vs user)

---

## Permissions & Scope

| Scope      | Permissions                                         |
| ---------- | --------------------------------------------------- |
| GLOBAL     | System category, cannot update or delete            |
| BUSINESS   | Business category, cannot update or delete          |
| FAMILY     | Shared among family, limited updates by owner/admin |
| INDIVIDUAL | Created by user, full CRUD for owner only           |

- Users **cannot modify system categories**.
- Only owners can update/delete individual categories.

---
