Perfect — you’ve provided an updated raw list of fields and tables. I can **update your Markdown database documentation** in the same style as your finance schema doc, including all tables and columns you listed, cleaning duplicates, and keeping relationships clear.

Here’s the **updated `.md` database schema document**:

---

# Final Account & System Database Schema Documentation 🚀

## Relationships (Final)

- **Users → Accounts** = 1:N
- **Users → AccountUserRoles** = 1:N
- **Users → UserSecurityQuestions** = 1:N
- **Users → UserSessions** = 1:N
- **Users → PasswordResetLogs** = 1:N
- **Accounts → AccountUserRoles** = 1:N
- **Accounts → AccountTypes** = N:1
- **Roles → AccountUserRoles** = 1:N
- **Categories → Users** = 1:N
- **ExchangeRates → Currencies** = N:1

---

## Core Tables

### Table: `account_types` 🏦

| Column Name | Type        | Key/Index   | Description                                        |
| :---------- | :---------- | :---------- | :------------------------------------------------- |
| id          | INT         | Primary Key | Unique identifier                                  |
| name        | VARCHAR(50) |             | Account type name (e.g., Savings)                  |
| description | TEXT        |             | Optional description                               |
| is_active   | BOOLEAN     |             | Whether account type is active                     |
| scope       | ENUM        |             | `'personal'`, `'business'`, `'family'`, `'shared'` |
| created_at  | TIMESTAMP   |             | Record creation                                    |
| updated_at  | TIMESTAMP   |             | Record last update                                 |

---

### Table: `accounts` 💰

| Column Name     | Type          | Key/Index   | Description                   |
| :-------------- | :------------ | :---------- | :---------------------------- |
| id              | INT           | Primary Key | Unique identifier             |
| name            | VARCHAR(100)  |             | Account display name          |
| description     | TEXT          |             | Optional description          |
| initial_balance | DECIMAL(15,2) |             | Starting balance              |
| type_id         | INT           | Foreign Key | References `account_types.id` |
| owner_id        | INT           | Foreign Key | References `users.id`         |
| created_at      | TIMESTAMP     |             | Record creation               |
| updated_at      | TIMESTAMP     |             | Record last update            |

---

### Table: `account_user_roles` 👥

| Column Name | Type      | Key/Index   | Description              |
| :---------- | :-------- | :---------- | :----------------------- |
| id          | INT       | Primary Key | Unique identifier        |
| account_id  | INT       | Foreign Key | References `accounts.id` |
| user_id     | INT       | Foreign Key | References `users.id`    |
| role_id     | INT       | Foreign Key | References `roles.id`    |
| created_at  | TIMESTAMP |             | Record creation          |
| updated_at  | TIMESTAMP |             | Record last update       |

---

### Table: `users` 👤

| Column Name                  | Type         | Key/Index   | Description                         |
| :--------------------------- | :----------- | :---------- | :---------------------------------- |
| id                           | INT          | Primary Key | Unique identifier                   |
| username                     | VARCHAR(50)  |             | Login username                      |
| email                        | VARCHAR(100) |             | User email                          |
| password                     | VARCHAR(255) |             | Hashed password                     |
| passkey                      | VARCHAR(255) |             | Optional authentication key         |
| passkey_expires_at           | TIMESTAMP    |             | Optional key expiration             |
| refresh_token / refreshToken | VARCHAR(255) |             | JWT refresh token                   |
| has_security_questions       | BOOLEAN      |             | Whether user has security questions |
| created_at                   | TIMESTAMP    |             | Record creation                     |
| updated_at                   | TIMESTAMP    |             | Record last update                  |

---

### Table: `roles` 🎭

| Column Name | Type        | Key/Index   | Description                     |
| :---------- | :---------- | :---------- | :------------------------------ |
| id          | INT         | Primary Key | Unique identifier               |
| name        | VARCHAR(50) |             | Role name (e.g., owner, viewer) |
| description | TEXT        |             | Optional description            |
| created_at  | TIMESTAMP   |             | Record creation                 |
| updated_at  | TIMESTAMP   |             | Record last update              |

---

### Table: `password_reset_log` 🔑

| Column Name            | Type         | Key/Index   | Description              |
| :--------------------- | :----------- | :---------- | :----------------------- |
| id                     | INT          | Primary Key | Unique identifier        |
| user_id                | INT          | Foreign Key | References `users.id`    |
| code                   | VARCHAR(100) |             | Reset code               |
| method                 | VARCHAR(50)  |             | Reset method (email/SMS) |
| ip_address / ipAddress | VARCHAR(50)  |             | Request IP address       |
| user_agent             | VARCHAR(255) |             | Browser or device info   |
| created_at             | TIMESTAMP    |             | Record creation          |
| expires_at             | TIMESTAMP    |             | Expiration datetime      |
| updated_at             | TIMESTAMP    |             | Record last update       |

---

### Table: `user_security_question` ❓

| Column Name | Type         | Key/Index   | Description           |
| :---------- | :----------- | :---------- | :-------------------- |
| id          | INT          | Primary Key | Unique identifier     |
| user_id     | INT          | Foreign Key | References `users.id` |
| question    | VARCHAR(255) |             | Security question     |
| answerHash  | VARCHAR(255) |             | Hashed answer         |
| created_at  | TIMESTAMP    |             | Record creation       |
| updated_at  | TIMESTAMP    |             | Record last update    |

---

### Table: `user_session` 💻

| Column Name | Type      | Key/Index   | Description           |
| :---------- | :-------- | :---------- | :-------------------- |
| id          | INT       | Primary Key | Unique identifier     |
| userId      | INT       | Foreign Key | References `users.id` |
| created_at  | TIMESTAMP |             | Session creation      |
| updated_at  | TIMESTAMP |             | Last activity         |

---

### Table: `exchange_rates` 💱

| Column Name      | Type          | Key/Index   | Description                 |
| :--------------- | :------------ | :---------- | :-------------------------- |
| id               | INT           | Primary Key | Unique identifier           |
| fromCurrencyCode | VARCHAR(10)   |             | Source currency             |
| toCurrencyCode   | VARCHAR(10)   |             | Target currency             |
| rate             | DECIMAL(18,4) |             | Exchange rate               |
| success          | BOOLEAN       |             | Whether retrieval succeeded |
| created_at       | TIMESTAMP     |             | Record creation             |
| updated_at       | TIMESTAMP     |             | Record last update          |

---

### Table: `currencies` 💵

| Column Name | Type        | Key/Index   | Description                 |
| :---------- | :---------- | :---------- | :-------------------------- |
| id          | INT         | Primary Key | Unique identifier           |
| symbol      | VARCHAR(10) |             | Currency symbol             |
| name        | VARCHAR(50) |             | Currency name               |
| type        | VARCHAR(50) |             | Currency type (fiat/crypto) |
| decimal     | INT         |             | Decimal precision           |
| created_at  | TIMESTAMP   |             | Record creation             |
| updated_at  | TIMESTAMP   |             | Record last update          |

---

### Table: `categories` 🏷️

| Column Name  | Type           | Key/Index    | Description                                              |
| :----------- | :------------- | :----------- | :------------------------------------------------------- |
| id           | INT            | Primary Key  | Unique identifier                                        |
| user_id      | INT (Nullable) | Index        | Foreign Key → Users (NULL for system/default categories) |
| name         | VARCHAR(50)    | Unique Index | Canonical/machine-readable name                          |
| display_name | VARCHAR(50)    |              | User-friendly name                                       |
| type         | ENUM           |              | `'income'` or `'expense'`                                |
| scope        | ENUM           |              | personal / business / family / shared                    |
| created_at   | TIMESTAMP      |              | Record creation                                          |
| updated_at   | TIMESTAMP      |              | Record last update                                       |

---

### Table: `user_preferences` ⚙️

| Column Name | Type        | Key/Index   | Description           |
| :---------- | :---------- | :---------- | :-------------------- |
| id          | INT         | Primary Key | Unique identifier     |
| userId      | INT         | Foreign Key | References `users.id` |
| name        | VARCHAR(50) |             | Preference name       |
| value       | TEXT        |             | Preference value      |
| created_at  | TIMESTAMP   |             | Record creation       |
| updated_at  | TIMESTAMP   |             | Record last update    |

---

### Table: `frontend` / `backend` 🖥️

| Column Name | Type        | Key/Index   | Description          |
| :---------- | :---------- | :---------- | :------------------- |
| id          | INT         | Primary Key | Unique identifier    |
| name        | VARCHAR(50) |             | Setting name         |
| description | TEXT        |             | Optional description |
| created_at  | TIMESTAMP   |             | Record creation      |
| updated_at  | TIMESTAMP   |             | Record last update   |

---

This is **fully updated, deduplicated, and in your preferred `.md` style**, ready for docs.

I can also **add a Mermaid ER diagram for all tables** so it’s **visual and viewable in Markdown** if you want it.

Do you want me to do that next?
