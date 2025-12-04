Here’s a **Markdown README** for your **Finance Currencies module**, structured for clarity and developer reference:

````markdown
# Finance Currencies Module

This module manages **currencies and exchange rates** in the finance system. It supports **listing, verifying, creating, updating, and seeding currencies**, as well as **managing exchange rates between currencies**.

All endpoints are documented with **Swagger**.

---

## Table of Contents

- [Entities](#entities)
- [DTOs](#dtos)
- [Controllers & Endpoints](#controllers--endpoints)
- [Services](#services)
- [Seeder](#seeder)
- [Notes](#notes)

---

## Entities

### Currency

Represents a supported currency.

| Field        | Type           | Description                       |
| ------------ | -------------- | --------------------------------- |
| code         | string         | ISO 4217 currency code (Primary)  |
| name         | string         | Currency name                     |
| symbol       | string         | Currency symbol                   |
| decimal      | number         | Number of decimal places          |
| isActive     | boolean        | Whether the currency is active    |
| createdAt    | Date           | Creation timestamp                |
| updatedAt    | Date           | Last updated timestamp            |
| fromRates    | ExchangeRate[] | Exchange rates from this currency |
| toRates      | ExchangeRate[] | Exchange rates to this currency   |
| transactions | Transaction[]  | Transactions using this currency  |
| accounts     | Account[]      | Accounts using this currency      |

---

### ExchangeRate

Represents the conversion rate between two currencies on a specific date.

| Field        | Type     | Description                   |
| ------------ | -------- | ----------------------------- |
| id           | number   | Primary key                   |
| fromCurrency | Currency | Source currency               |
| toCurrency   | Currency | Target currency               |
| rate         | number   | Exchange rate value           |
| date         | string   | Date of the rate (YYYY-MM-DD) |
| createdAt    | Date     | Timestamp of creation         |

**Indexes & Constraints:**

- `@Index(['fromCurrency', 'toCurrency', 'date'], { unique: true })` ensures unique rates per currency pair per date.

---

## DTOs

### CreateCurrencyDto

| Field     | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| code      | string  | Currency code (ISO 4217)               |
| name      | string  | Currency name                          |
| symbol    | string  | Currency symbol                        |
| decimal?  | number  | Optional decimals (default: 2)         |
| isActive? | boolean | Optional active status (default: true) |

### UpdateCurrencyDto

- Partial type of `CreateCurrencyDto` for updating currency information.

### CreateExchangeRateDto

| Field | Type   | Description                   |
| ----- | ------ | ----------------------------- |
| from  | string | Source currency code          |
| to    | string | Target currency code          |
| rate  | number | Exchange rate value           |
| date  | string | Date of the rate (YYYY-MM-DD) |

### FilterExchangeRateDto

| Field | Type   | Description             |
| ----- | ------ | ----------------------- |
| from  | string | Source currency code    |
| to    | string | Target currency code    |
| date? | string | Optional filter by date |

---

## Controllers & Endpoints

All endpoints are under `/finance/currencies`.

| Method | Endpoint              | Description                   | Auth Required |
| ------ | --------------------- | ----------------------------- | ------------- |
| GET    | `/finance/currencies` | List all supported currencies | ✅            |

> Returns:

```ts
{
  success: boolean,
  message: string,
  data: Currency[]
}
```
````

---

## Services

### CurrencyService

- `listCurrencies()` – Lists all active currencies (code, name, symbol, decimal, isActive).
- `verifyCurrency(code)` – Validates a currency code exists, throws `BadRequestException` if invalid.

### ExchangeRateService

- `updateRate(dto)` – Creates or updates an exchange rate for a currency pair on a specific date.
- `getRate(filters)` – Retrieves exchange rates filtered by `from`, `to`, and optional `date`.

---

## Seeder

### CurrencySeeder

Seeds **default currencies** into the database.

**Command:**

```bash
npm run command currency:seed
```

**Behavior:**

- Truncates the `currencies` table and cascades dependent tables.
- Inserts all `defaultCurrencies`.
- Logs success after seeding.

---
