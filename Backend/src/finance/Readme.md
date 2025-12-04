# 💰 Finance Module

The **Finance Module** is a comprehensive suite for managing all financial operations in the system.
It integrates **accounts, transactions, ledgers, categories, currencies, savings goals, and summaries**, providing full CRUD, reporting, and automation support.

This module is designed for **multi-user access with roles/permissions**, supporting personal, shared, business, and system-wide financial operations.

---

## 🧭 Table of Contents

- [Submodules](#submodules)
- [Shared Concepts](#shared-concepts)
- [Authentication & Authorization](#authentication--authorization)
- [Standard Response Format](#standard-response-format)
- [Installation & Seeder](#installation--seeder)
- [Notes](#notes)
- [Contribution](#contribution)
- [References](#references)

---

## 🛠️ Submodules

Each submodule has its own dedicated README and responsibilities:

| Submodule                 | Description                                                                       | README Link                                                     |
| :------------------------ | :-------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **Accounts**              | User accounts, account types, roles, balances, and ownership transfers            | [Accounts Module](./accounts/README.md)                         |
| **Categories**            | Income & expense categories, scopes, CRUD, and statistics                         | [Categories Module](./categories/README.md)                     |
| **Currencies**            | Supported currencies and exchange rates                                           | [Currencies Module](./currencies/README.md)                     |
| **Savings Goals**         | User savings goals linked to dedicated accounts                                   | [Savings Goals Module](./savings-goals/README.md)               |
| **Transactions & Ledger** | Financial transactions, ledgers, recurring transactions, and optimized statements | [Transactions & Ledger Module](./transactions-ledger/README.md) |
| **Finance Summary**       | Daily, weekly, monthly, yearly summaries, trends, and category aggregates         | [Finance Summary Module](./summary/README.md)                   |

---

## 💡 Shared Concepts

- **Decimal Strings for Amounts:** All monetary values are stored as strings to maintain precision.
- **Immutable Ledger:** Ledger entries cannot be modified; updates create new entries.
- **Scopes & Roles:** Accounts and categories respect ownership, admin/editor/viewer roles, and system vs user scopes.
- **Timestamps:** All entities track `createdAt` and `updatedAt`.

---

## 🔒 Authentication & Authorization

- All endpoints require **JWT authentication**.
- Role-based access is enforced at the **account and submodule level**.
- Only owners or admins can perform sensitive operations like transferring ownership or deleting system-level resources.

---

## ➡️ Standard Response Format

All submodules follow a consistent API response:

```typescript
{
  success: boolean,
  message: string,
  data: any
}
```

- `success` — `true` if operation succeeds, `false` otherwise.
- `message` — Description of operation result.
- `data` — Payload; may be `null` on failure.

---

## 🚀 Installation & Seeder

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run all seeders** to populate default currencies, categories, account types, etc.:

    ```bash
    npm run seed:categories
    npm run seed:currency
    npm run seed:account-types
    ```

3.  **Start the server:**

    ```bash
    npm run start:dev
    ```

---

## 📝 Notes

- Submodules are **loosely coupled** but share core entities like `Account`, `User`, `Currency`, and `Transaction`.
- Bulk operations (transactions, summaries) are optimized to minimize database writes.
- Future enhancements may include **recurring transaction automation** and **advanced reporting**.

---

## 🤝 Contribution

- Each submodule has its own directory and README.
- Developers should follow **submodule-specific guidelines** for creating controllers, services, and DTOs.

---

## 🔗 References

- [Accounts Module README](./accounts/Readme.md)
- [Categories Module README](./categories//Readme.md)
- [Currencies Module README](./currency//Readme.md)
- [Savings Goals Module README](./savings-goals/Readme.md)
- [Transactions & Ledger Module README](./transactions/Readme.md)
- [Finance Summary Module README](./summary/Readme.md)

<!-- end list -->

```

```

```

```
