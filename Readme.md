# MindVault

## Project Overview

**MindVault** is a comprehensive, multi-user platform designed to manage **personal data, financial operations, and life organization**.  
It combines secure authentication, role-based access control, and modular architecture to provide a scalable system for managing users, roles, accounts, transactions, and personal growth tools.

Key features include:

- **User & Authentication Management:** Signup, login, passkey and security question-based password recovery, session handling, and user preferences.
- **Roles & Permissions:** Flexible role-based access control for users and accounts, supporting owners, admins, editors, and viewers.
- **Finance Management:** Full CRUD support for accounts, transactions, ledgers, categories, currencies, and savings goals.
- **Finance Summaries & Reporting:** Generate daily, weekly, monthly, and yearly summaries with trends and aggregates.
- **Seeding & Automation:** Default roles, categories, currencies, and account types seeded automatically for easy setup.
- **API Documentation:** Swagger UI available at [http://localhost:3000/api/v1/docs#/](http://localhost:3000/api/v1/docs#/).
- **Secure & Reliable:** All endpoints require JWT authentication; sensitive data is protected; financial operations are auditable and immutable.

---

## Architecture Overview

- **Modular Design:** Each feature (Auth, Roles, Finance, etc.) is encapsulated as its own module with dedicated controllers, services, DTOs, and entities.
- **Backend:** NestJS + TypeORM with PostgreSQL for structured, reliable database interactions.
- **Role-Based Access Control:** Permissions enforced per module, per account, and per operation.
- **Consistent API Response:** All endpoints return a standard format with `success`, `message`, and `data`.
- **Separation of Concerns:** Authentication, user preferences, financial transactions, and reporting are loosely coupled for maintainability and scalability.

---

## Future Plans

MindVault will expand into a **personal growth and life management suite** with:

- **LifeLog:** Capture daily activities, habits, and reflections.
- **Contacts:** Personal directory for friends, family, colleagues, and important people.
- **Capsule:** Space to capture thoughts, reflections, or memorable moments.
- **Knowledge:** Organize notes, learnings, and resources in a knowledge base.
- **Micro Actions:** Track small goals and tasks with weekly or monthly summaries.
- **Storyline:** Narrative builder to weave actions, memories, and reflections into meaningful life stories.

---

## Technology Stack

- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL (via TypeORM)
- **Authentication:** JWT, passkeys, security questions
- **API Documentation:** Swagger (auto-generated)
- **Seeders & CLI Tools:** NestJS Command for default data population
- **Frontend:** [MindVault Frontend Repository](https://github.com/marceldavidbaroi/MindVault_Frontend)

---

## Development Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/marceldavidbaroi/MindVault_Backend.git
cd MindVault_Backend/Backend

```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Run database migrations and seeders:**

```bash
npm run seed:roles
npm run seed:categories
npm run seed:currencies
npm run seed:account-types
npm run seed:tag-groups
npm run seed:tags

```

4. **Start the development server:**

```bash
npm run start:dev
```

5. **Access Swagger API documentation:**

[http://localhost:3000/api/v1/docs#/](http://localhost:3000/api/v1/docs#/)

---

## Goals

- Provide a **reliable, secure, and extendable backend** for personal finance and life management.
- Support **multi-user, role-aware operations** for both finance and personal growth features.
- Maintain **auditability, consistency, and immutability** across all financial and personal records.
- Enable future expansion into **LifeLog, Contacts, Capsule, Knowledge, Micro Actions, and Storyline** features.

---

✅ MindVault is designed for scalability, security, and modularity, providing a solid foundation for both current financial features and upcoming personal growth tools.
