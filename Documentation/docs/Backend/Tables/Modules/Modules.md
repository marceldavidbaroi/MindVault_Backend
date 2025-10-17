---
title: Modules Table
description: Schema and seeded data for the modules table
---

# Modules Table

The `modules` table is a **static registry** that stores all modules in the backend system.  
It helps with **tag separation, categorization, and cross-referencing** between modules.

---

## Table Schema

| Column         | Type                   | Description                                                      |
| -------------- | ---------------------- | ---------------------------------------------------------------- |
| `id`           | integer                | Primary key (auto-increment).                                    |
| `name`         | varchar(100)           | Unique submodule name (e.g., `contacts`, `capsule`).             |
| `parentModule` | varchar(100), nullable | Parent module name (e.g., `finance`, `linklog`). `null` if root. |
| `description`  | text, nullable         | Optional description of the module.                              |
| `createdAt`    | timestamp              | Auto-generated timestamp when record is created.                 |
| `updatedAt`    | timestamp              | Auto-updated timestamp when record is modified.                  |

---

## Seeded Data

The table is **seeded only once** when the database is empty.  
If changes are made in code, the table must be **dropped** and the **server restarted** to apply updates.

### Root Modules

| Name      | Parent | Description |
| --------- | ------ | ----------- |
| `auth`    | `null` |             |
| `finance` | `null` |             |
| `linklog` | `null` |             |
| `modules` | `null` |             |

### Finance Submodules

| Name                | Parent    | Description |
| ------------------- | --------- | ----------- |
| `transactions`      | `finance` |             |
| `budgets`           | `finance` |             |
| `reports`           | `finance` |             |
| `savings-goals`     | `finance` |             |
| `finance-dashboard` | `finance` |             |

### LinkLog Submodules

| Name            | Parent    | Description                    |
| --------------- | --------- | ------------------------------ |
| `contacts`      | `linklog` | Contacts module under LinkLog  |
| `capsule`       | `linklog` | Capsule module under LinkLog   |
| `storyline`     | `linklog` | Storyline module under LinkLog |
| `micro-actions` | `linklog` |                                |

---

## Notes

- The data in this table is **developer-defined** and **not dynamic**.
- To change modules or parents:
  1. Drop the `modules` table.
  2. Restart the server to trigger seeding.
