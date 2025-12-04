# Finance Summary Module

## Overview

The **Finance Summary Module** provides automated aggregation of financial transactions into **daily, weekly, monthly, and yearly summaries**, both overall and by category. It supports reporting, trend analysis, and top-category insights for accounts.

The module handles:

- Real-time updates on transaction create, update, and delete.
- Aggregation by account, date/week/month/year, and category.
- Trend and comparison analysis across different periods.

---

## Endpoints

| Method | Route                                                                              | Description                                          | Auth Required | Roles / Permissions |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------- | ------------------- |
| GET    | /daily-summaries/:accountId                                                        | Get daily summary for an account                     | ✅            | user/admin          |
| GET    | /daily-summaries/:accountId/comparison                                             | Get daily comparison for an account                  | ✅            | user/admin          |
| GET    | /daily-summaries/:accountId/last-n-days?n=N                                        | Get last N days of daily summaries                   | ✅            | user/admin          |
| GET    | /weekly-summaries/:accountId?weekStart=YYYY-MM-DD                                  | Get weekly summary for an account                    | ✅            | user/admin          |
| GET    | /weekly-summaries/:accountId/comparison?weekStart=YYYY-MM-DD                       | Get weekly comparison                                | ✅            | user/admin          |
| GET    | /weekly-summaries/:accountId/last-n-weeks?n=N                                      | Get last N weeks of summaries                        | ✅            | user/admin          |
| GET    | /monthly-summaries/:accountId?month=MM&year=YYYY                                   | Get monthly summary                                  | ✅            | user/admin          |
| GET    | /monthly-summaries/:accountId/comparison?month=MM&year=YYYY                        | Get monthly comparison                               | ✅            | user/admin          |
| GET    | /monthly-summaries/:accountId/last-n-months?n=N                                    | Get last N months of summaries                       | ✅            | user/admin          |
| GET    | /yearly-summaries/:accountId?year=YYYY                                             | Get yearly summary                                   | ✅            | user/admin          |
| GET    | /yearly-summaries/:accountId/comparison?year=YYYY                                  | Get yearly comparison                                | ✅            | user/admin          |
| GET    | /yearly-summaries/:accountId/last-n-years?n=N                                      | Get last N years of summaries                        | ✅            | user/admin          |
| GET    | /category-summaries/:accountId/daily?date=YYYY-MM-DD                               | Get daily category summary                           | ✅            | user/admin          |
| GET    | /category-summaries/:accountId/monthly?month=MM&year=YYYY                          | Get monthly category summary                         | ✅            | user/admin          |
| GET    | /summaries/:accountId/comparison?date=YYYY-MM-DD                                   | Get all comparisons (daily, weekly, monthly, yearly) | ✅            | user/admin          |
| GET    | /summaries/:accountId/daily?date=YYYY-MM-DD                                        | Get daily category summary (via master endpoint)     | ✅            | user/admin          |
| GET    | /summaries/:accountId/monthly?month=MM&year=YYYY                                   | Get monthly category summary (via master endpoint)   | ✅            | user/admin          |
| GET    | /trend-insights/:accountId/trend?period=PERIOD&n=N                                 | Get income/expense trend                             | ✅            | user/admin          |
| GET    | /trend-insights/:accountId/top-categories?period=PERIOD&dateOrMonth=VAL&year=YYYY? | Get top categories                                   | ✅            | user/admin          |

> 🔹 Replace `PERIOD` with `daily`, `weekly`, `monthly`, or `yearly`.  
> 🔹 `dateOrMonth` is `YYYY-MM-DD` for daily and `MM` for monthly.  
> 🔹 `year` is optional for daily top categories, defaults to current year.

---

## Business Logic / Rules

- Summaries are **incrementally updated** whenever a transaction is created, updated, or deleted.
- Role-based access control: Only authorized users can access or modify summaries.
- Category summaries aggregate totals per type (`income` or `expense`) for daily and monthly periods.
- Week starts on **Monday** for weekly summaries.
- All amounts are stored as **decimal strings** for precision.
- Trend analysis and comparisons are automatically generated across different periods.
- Edge cases:
  - If no transactions exist for a period, `data` will be empty.
  - Invalid account IDs or unauthorized access return appropriate error messages.

---

## Entities / Relationships

| Entity                 | Relation Type                         | Notes                                      |
| ---------------------- | ------------------------------------- | ------------------------------------------ |
| DailySummary           | ManyToOne Account                     | Each daily summary belongs to an account   |
| WeeklySummary          | ManyToOne Account                     | Each weekly summary belongs to an account  |
| MonthlySummary         | ManyToOne Account                     | Each monthly summary belongs to an account |
| YearlySummary          | ManyToOne Account                     | Each yearly summary belongs to an account  |
| DailyCategorySummary   | ManyToOne Account, ManyToOne Category | Daily totals grouped by category           |
| MonthlyCategorySummary | ManyToOne Account, ManyToOne Category | Monthly totals grouped by category         |

---

## DTOs (Data Transfer Objects)

| DTO Name                     | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| GetDailySummaryDto           | Fetch daily summary for an account             |
| GetWeeklySummaryDto          | Fetch weekly summary                           |
| GetMonthlySummaryDto         | Fetch monthly summary                          |
| GetYearlySummaryDto          | Fetch yearly summary                           |
| GetDailyCategorySummaryDto   | Fetch daily category summary                   |
| GetMonthlyCategorySummaryDto | Fetch monthly category summary                 |
| GetTrendDto                  | Fetch trend insights                           |
| GetTopCategoriesDto          | Fetch top categories for daily/monthly periods |

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

- `success` — `true` if the request succeeded, `false` otherwise.
- `message` — Descriptive message about the operation.
- `data` — Payload containing requested summary or comparison data; may be `null` if operation fails.
