# Finance Currencies Module

## Overview

The **Finance Currencies Module** manages supported currencies in the system.  
It provides a **read-only API** for listing currencies and a **shared validator** that other modules can use to **verify currency codes safely and consistently**.

This module does **not** handle currency exchange rates, conversions, or filtering logic.

All endpoints are documented with **Swagger**.

---

## Endpoints

| Method | Route               | Description                   | Auth Required | Roles / Permissions |
| -----: | ------------------- | ----------------------------- | ------------- | ------------------- |
|    GET | /finance/currencies | List all supported currencies | ✅            | authenticated user  |

### Response Format

```ts
{
  success: boolean;
  message: string;
  data: Currency[];
}
```

---

## Business Logic / Rules

- Only **active currencies** are considered valid.
- Currency codes must exist and be active to pass validation.
- No creation, update, or deletion endpoints are exposed.
- No filtering or search parameters are supported.
- Currency verification logic is centralized in a **shared validator**.
- Other modules **must not query the currency table directly**.

---

## Entities / Relationships

### Currency

Represents a supported currency in the system.

| Field     | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| code      | string  | ISO 4217 currency code (Primary) |
| name      | string  | Currency name                    |
| symbol    | string  | Currency symbol                  |
| decimal   | number  | Number of decimal places         |
| isActive  | boolean | Whether the currency is active   |
| createdAt | Date    | Creation timestamp               |
| updatedAt | Date    | Last updated timestamp           |

> The `code` field is the primary identifier and is immutable.

---

## DTOs (Data Transfer Objects)

This module does **not** expose DTOs for mutation operations.

All currency data is returned using the `Currency` entity shape.

---

## Services

### CurrencyService

Handles read-only operations related to currencies.

#### Methods

- `listCurrencies()`
  - Returns all currencies
  - Excludes internal timestamps where needed
  - Used only by the HTTP controller

---

## Validators

### CurrencyValidator

A **shared domain validator** used across modules to validate currency codes.

#### Purpose

- Ensures a currency exists
- Ensures the currency is active
- Centralizes currency validation logic
- Prevents duplication and inconsistent checks

#### Method

```ts
ensureCurrencyExists(code: string): Promise<Currency>
```

#### Behavior

- Throws `BadRequestException` if:
  - Currency does not exist
  - Currency is inactive

#### Usage Example (Other Modules)

```ts
await this.currencyValidator.ensureCurrencyExists(dto.currencyCode);
```

✅ This validator is **exported** and intended for cross-module usage.

---

## Seeder

### CurrencySeeder

Seeds default currencies into the database.

#### Command

```bash
npm run command currency:seed
```

#### Behavior

- Truncates the `currencies` table
- Inserts predefined default currencies
- Logs execution status

> Seeders are CLI-only and are **not exposed** to HTTP or other modules.

---

## Standard Response Format

All endpoints return responses in the following format:

```ts
{
  success: boolean;
  message: string;
  data: any;
}
```

---

## Design Notes

- Currency mutation is intentionally restricted.
- Exchange rates and conversions belong to a **separate finance module**.
- Validators are preferred over services for cross-module dependencies.
- This module follows **strict separation of concerns**:
  - Controller → Service → Repository
  - Validator for shared rules
  - Seeder for CLI-only logic

---

## Summary

- ✅ Read-only currency access
- ✅ Centralized validation
- ✅ Clean module boundaries
- ✅ Safe cross-module usage
- ✅ No exchange-rate complexity

This module acts as a **source of truth for supported currencies** in the system.
