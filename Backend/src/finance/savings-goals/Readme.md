Here’s a **Markdown README** for your **Finance Savings Goals module** based on your code:

````markdown
# Finance Savings Goals Module

This module manages **savings goals** for users, including creation, progress tracking, updates, and deletion. Each savings goal is associated with a **dedicated account** in the finance system.

All endpoints are protected via **JWT authentication** and are documented with **Swagger**.

---

## Table of Contents

- [Entities](#entities)
- [DTOs](#dtos)
- [Controllers & Endpoints](#controllers--endpoints)
- [Services](#services)
- [Notes](#notes)

---

## Entities

### SavingsGoal

Represents a user's savings goal.

| Field         | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| id            | number  | Primary key                                  |
| account       | Account | Dedicated account linked to this goal        |
| name          | string  | Name of the savings goal                     |
| purpose       | string  | Optional description or purpose              |
| target_amount | string  | Target amount to save (decimal)              |
| target_date   | string  | Optional target completion date (YYYY-MM-DD) |
| status        | string  | `active` \| `achieved` \| `cancelled`        |
| created_at    | Date    | Creation timestamp                           |
| updated_at    | Date    | Last updated timestamp                       |

**Relationships:**

- `account` → One-to-One relationship with **Account** entity.

---

## DTOs

### CreateSavingsGoalDto

| Field         | Type   | Description                                 |
| ------------- | ------ | ------------------------------------------- |
| name          | string | Display name of the savings goal (required) |
| purpose?      | string | Optional description or purpose             |
| targetAmount  | string | Target amount to save (decimal, required)   |
| currencyCode  | string | Currency code (e.g., USD, EUR)              |
| accountTypeId | number | ID of account type for the goal account     |
| targetDate?   | string | Optional target completion date             |

### UpdateSavingsGoalDto

Partial version of `CreateSavingsGoalDto` for updating a goal.  
All fields are optional.

| Field          | Type   | Description                    |
| -------------- | ------ | ------------------------------ |
| name?          | string | Updated goal name              |
| purpose?       | string | Updated description            |
| targetAmount?  | string | Updated target amount          |
| currencyCode?  | string | Updated currency code          |
| accountTypeId? | number | Updated account type ID        |
| targetDate?    | string | Updated target completion date |

---

## Controllers & Endpoints

All endpoints are under `/finance/savings-goals`.

| Method | Endpoint                     | Description                                     | Auth Required |
| ------ | ---------------------------- | ----------------------------------------------- | ------------- |
| POST   | `/finance/savings-goals`     | Create a new savings goal and dedicated account | ✅            |
| GET    | `/finance/savings-goals/my`  | List all goals associated with the current user | ✅            |
| GET    | `/finance/savings-goals/:id` | Get a single goal and its progress              | ✅            |
| PUT    | `/finance/savings-goals/:id` | Update a savings goal                           | ✅            |
| DELETE | `/finance/savings-goals/:id` | Delete a savings goal and its linked account    | ✅            |

**Response format (example):**

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

### SavingsGoalsService

- `createGoal(user, dto)` – Creates a new savings goal and a dedicated account.
- `listUserGoals(user)` – Returns all savings goals for the current user with account details.
- `getGoalProgress(goalId)` – Returns a single goal and its current progress (account balance).
- `updateGoal(user, goalId, dto)` – Updates goal fields and associated account metadata.
- `deleteGoal(user, goalId)` – Deletes a goal and its linked account after access check.

**Access control:**

- Users can only update or delete goals for accounts they have access to.
- Throws `ForbiddenException` if the user lacks access.

---
