Here’s a structured API documentation for your **Reports module**, following the style of your previous modules (Transactions, Dashboard, Budgeting, Savings Goals):

---

# Reports API

**Base URL:** `/reports`
All endpoints require **JWT authentication**.

---

## Endpoints

| Endpoint                   | Method | Description                                                     | Payload / Query DTO    |
| -------------------------- | ------ | --------------------------------------------------------------- | ---------------------- |
| `/reports`                 | GET    | List all reports with optional filters                          | `FilterReportsDto`     |
| `/reports`                 | POST   | Generate a new report (monthly, half-yearly, yearly)            | `CreateReportDto`      |
| `/reports/top-categories`  | GET    | Get top 3 categories by spending for a given month/year         | Query: `month`, `year` |
| `/reports/category-charts` | GET    | Get charts data (pie/bar) for categories for a given month/year | Query: `month`, `year` |
| `/reports/:id`             | GET    | Get a single report by ID                                       | -                      |
| `/reports/:id`             | PATCH  | Update a report                                                 | -                      |
| `/reports/:id`             | DELETE | Delete a cached report                                          | -                      |

---

## DTOs

### CreateReportDto

**Example JSON:**

```json
{
  "reportType": "monthly",
  "month": 9,
  "year": 2025,
  "half": 1
}
```

| Field      | Type   | Required | Notes                                                   |                                           |
| ---------- | ------ | -------- | ------------------------------------------------------- | ----------------------------------------- |
| reportType | enum   | ✅       | `monthly`, `half_yearly`, `yearly`                      |                                           |
| month      | number | ❌       | Required for `monthly` and `half_yearly` reports (1–12) |                                           |
| year       | number | ❌       | Optional year for report                                |                                           |
| half       | 1      | 2        | ❌                                                      | Required if `reportType` is `half_yearly` |

---

### FilterReportsDto (Query)

**Example Query:**

```
GET /reports?reportType=monthly&month=9&year=2025&half=1
```

| Field      | Type   | Default | Optional | Notes                              |                                     |
| ---------- | ------ | ------- | -------- | ---------------------------------- | ----------------------------------- |
| reportType | enum   | -       | ✅       | `monthly`, `half_yearly`, `yearly` |                                     |
| month      | number | -       | ✅       | 1–12 only                          |                                     |
| year       | number | -       | ✅       | Optional year filter               |                                     |
| half       | 1      | 2       | -        | ✅                                 | Only 1 or 2 for half-yearly reports |

---

### Top Categories & Category Charts

**Query Parameters (optional):**

| Field | Type   | Required | Notes                          |
| ----- | ------ | -------- | ------------------------------ |
| month | number | ❌       | Filter data for specific month |
| year  | number | ❌       | Filter data for specific year  |

**Responses:**

- **Top Categories:** Returns an array of `{ category: string, totalSpent: number }`.
- **Category Charts:** Returns chart-ready data (pie/bar) for each category.

---
