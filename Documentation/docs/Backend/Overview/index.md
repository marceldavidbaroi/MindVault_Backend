---
title: Module Overview
description: Overview of the backend modules
---

import Link from '@docusaurus/Link';

# Module Overview

This documentation provides a high-level overview of the backend system.

---

## Auth Module

Handles user authentication and authorization.  
All endpoints related to user login, registration, JWT management, and permissions.

[Go to Auth Documentation →](/docs/Backend/Overview/Auth)

---

## Finance Module

Parent module for all financial operations.  
Contains submodules like Transactions, Dashboard, Budgeting, Savings Goals, and Reports.

[Go to Finance Documentation →](/docs/Backend/Overview/Finance)

---

## Modules Module

Acts as a central registry of all modules in the system.  
Stores each module’s **name** and its **parent module** to support features like tag separation, categorization, and cross-referencing between modules.

[Go to Modules Documentation →](/docs/Backend/Overview/Modules)

---

## Tags Module

Responsible for managing tags that categorize and organize contacts and other module-specific data.  
Supports both **system-defined tags** and **user-created custom tags**.

- Predefined **system tags** that cannot be modified by users.
- Allows users to create **custom tags** with optional colors and descriptions.
- Each tag is associated with a **module_name** (e.g., `contacts`) for contextual relevance.
- Tracks timestamps (`created_at` and `updated_at`) for auditing purposes.

[Go to Tags Documentation →](/docs/Backend/Overview/Tags)
