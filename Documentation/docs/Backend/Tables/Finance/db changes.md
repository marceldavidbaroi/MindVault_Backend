# Implementation Roadmap for Scalable Finance Schema Refactor

This roadmap outlines a four-phase plan to implement the critical schema changes, including the new **Categories table** and the **three Materialized Views (Summary Tables)**. The plan prioritizes setting up the necessary infrastructure, then establishing the data integrity pipeline, and finally refactoring the read-heavy features for maximum performance.

---

## Phase 0: Setup and Preparation

The goal is to create the necessary code modules and set up initial data structures without affecting existing features.

| Step | Task | Target Module(s) | Notes |
| :--- | :--- | :--- | :--- |
| **0.1** | **Create `CategoriesModule`** | `CategoriesModule` | Define the `Categories` entity and repository. **Pre-populate** this table with all system/default income and expense categories. |
| **0.2** | **Create `SummaryModule`** | `SummaryModule` | Define the three new entities (`daily_summary`, `monthly_summary`, `category_monthly_summary`) and their repositories. Create the basic `SummaryService` shell. |
| **0.3** | **Set `DATE` type consistency** | All Tables | Ensure all date columns (`Transactions.date`, `Reports.period_start`, etc.) are consistently using the SQL **`DATE`** type (YYYY-MM-DD format). |

---

## Phase 1: Database Refactoring & Data Migration 💾

This phase involves the critical structural changes to the database and requires careful data migration.

| Step | Task | Target Tables | Rationale |
| :--- | :--- | :--- | :--- |
| **1.1** | **Deploy New Tables** | `Categories`, `daily_summary`, `monthly_summary`, `category_monthly_summary` | Deploy all 4 new tables with their defined Primary Keys and **Composite Indexes**. |
| **1.2** | **Migrate Category Data (Crucial Step)** | `Transactions`, `Budgets` | 1. Add the new **`category_id`** column (`INT`) to both tables. 2. Run a migration script: Map existing string/enum category values to the corresponding `id` in the new `Categories` table. |
| **1.3** | **Remove Legacy Column** | `Transactions`, `Budgets` | Once migration is verified, **drop the old `category` column** to enforce the new foreign key relationship. |

---

## Phase 2: Implementing the Write Path (Data Integrity) ✍️

This phase establishes the **data integrity pipeline**, shifting the computational load from read queries to write operations by updating the materialized views.

| Step | Task | Target Module(s) | Rationale |
| :--- | :--- | :--- | :--- |
| **2.1** | **Develop `SummaryService` Logic** | `SummaryService` | Implement the upsert logic for the three core methods (`updateDailySummary`, `updateMonthlySummary`, `updateCategoryMonthlySummary`). This includes recalculating the `net_savings_rate`. |
| **2.2** | **Hook into Transactions Service** | `TransactionsService` | Import and inject `SummaryService`. Modify the `create`, `update`, and `delete` methods to call the corresponding `SummaryService` methods *immediately after* the database change. |
| **2.3** | **Refactor Savings Goals Hook** | `SavingsGoalsService` | Ensure any method that alters a transaction related to a savings goal (like adding a contribution) correctly triggers the `TransactionsService` hook. |
| **2.4** | **Initial Summary Backfill** | N/A | Run a **one-time backfill script** to aggregate all historical transactions and fully populate the three summary tables. |

---

## Phase 3: Performance Refactoring (The Read Path) 📈

This phase refactors the high-traffic features to read exclusively from the fast, pre-aggregated summary tables.

| Step | Task | Target Module(s) | Performance Benefit |
| :--- | :--- | :--- | :--- |
| **3.1** | **Refactor Budget Alerts** | `BudgetsService` | Change `getBudgetAlerts()` to query **`category_monthly_summary`** directly to get total spending per category for the current period (solves the N+1 query problem). |
| **3.2** | **Refactor Dashboard Metrics** | `FinanceDashboardService` | Rewrite all summary metrics (Daily totals, MoM comparison, Net Savings Rate) to read from **`daily_summary` and `monthly_summary`**. |
| **3.3** | **Refactor Reporting Engine** | `ReportsService` | Change report generation to pull aggregated figures and time-series data from the summary tables instead of joining and summing the large `Transactions` table. |
| **3.4** | **Testing & Benchmarking** | All Modules | Execute load tests to verify the dramatic performance improvements on Dashboard and Report endpoints. |

---

## Phase 4: New Feature & Rollout ✨

The final phase implements the flexibility feature enabled by the new schema and prepares for deployment.

| Step | Task | Target Module(s) | Objective |
| :--- | :--- | :--- | :--- |
| **4.1** | **Implement Custom Category CRUD** | `CategoriesModule` | Build the API endpoints for users to **create, read, update, and delete custom categories** (managing rows where `Categories.user_id` is present). |
| **4.2** | **Update UI/UX** | Frontend | Update all forms (Transaction entry, Budget setup) to select categories using the new **`category_id`** foreign key and display the flexible `display_name`. |
| **4.3** | **Final End-to-End QA** | All Modules | Comprehensive testing to confirm that the new write path is stable and that all API response times meet the performance targets. |