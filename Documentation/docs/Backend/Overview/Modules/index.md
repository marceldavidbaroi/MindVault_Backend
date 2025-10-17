---
title: Modules Module
description: Static registry of all backend modules
---

# Modules Module

The **Modules Module** serves as a **static registry** of all backend modules.  
It creates and manages a database table that contains:

- **Module name** – the identifier of the module (e.g., `auth`, `finance`, `transactions`).
- **Parent module** – the parent module under which the module is categorized (or `null` if it’s a root module).

---

## Key Characteristics

- **Static, developer-defined data**  
  The list of modules is not generated dynamically at runtime. Instead, it is **hardcoded and seeded** into the database.

- **Seeding behavior**
  - On first setup, the table is seeded with the predefined module data.
  - If changes are made in the code (e.g., new module added, renamed, or parent changed), the existing table must be **dropped/deleted**.
  - The server must then be **restarted** to re-seed the updated module data.

---

## Purpose

This module ensures a consistent, predictable registry of all backend modules.  
It is mainly used for:

- **Tag separation**
- **Categorization**
- **Cross-referencing between modules**
