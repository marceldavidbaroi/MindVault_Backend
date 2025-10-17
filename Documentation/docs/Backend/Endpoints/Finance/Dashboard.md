Here’s the structured API documentation for your **Dashboard / Overview** module, following the same style as your Transactions doc:

---

# Dashboard / Overview

**Base URL:** `/dashboard`
All endpoints require **JWT authentication**.

---

## Endpoints

| Endpoint                        | Method | Description                                                                                          | Payload / Query DTO    |
| :------------------------------ | :----- | :--------------------------------------------------------------------------------------------------- | :--------------------- |
| `/dashboard/overview`           | GET    | Returns a summary: total income, total expenses, net savings, and spending per category (for charts) | `SummaryQueryDto`      |
| `/dashboard/monthly-comparison` | GET    | Compares current vs previous months                                                                  | `CompareMonthQueryDto` |
| `/dashboard/alerts`             | GET    | Returns alerts for overspending or approaching budget limits                                         | `SummaryQueryDto`      |

---

## DTOs

### SummaryQueryDto (Query)

**Example Query:**

```
GET /dashboard/overview?startDate=2025-01-01&endDate=2025-12-31
```

| Field     | Type   | Required | Notes                                       |
| :-------- | :----- | :------- | :------------------------------------------ |
| startDate | string | ❌       | Filter summary from this date (YYYY-MM-DD)  |
| endDate   | string | ❌       | Filter summary up to this date (YYYY-MM-DD) |

**Validation:** Must match `YYYY-MM-DD` format.

---

### CompareMonthQueryDto (Query)

**Example Query:**

```
GET /dashboard/monthly-comparison?startDate=2025-09-01
```

| Field     | Type   | Required | Notes                                              |
| :-------- | :----- | :------- | :------------------------------------------------- |
| startDate | string | ❌       | Optional start date to compare months (YYYY-MM-DD) |

**Validation:** Must match `YYYY-MM-DD` format.

---
