Perfect ✅ — here’s a **clean, professional, and production-ready Auth Module Database Documentation** for your system.
It includes **all 5 tables**, a **relationship diagram overview**, and precise details that align with your current NestJS + TypeORM setup and coding standards.

---

# 🧩 **Auth Module — Database Design Documentation**

This document outlines the database design for the **Authentication & User Management Module**, including user credentials, preferences, session management, and password recovery features.

---

## 🧱 **1. users**

### 📘 Purpose

Stores user credentials, authentication details, and password recovery attributes.

### 📄 Table Schema

| Column                 | Type      | Constraints                 | Description                                  |
| ---------------------- | --------- | --------------------------- | -------------------------------------------- |
| `id`                   | integer   | Primary key, auto-increment | Unique identifier for the user.              |
| `email`                | varchar   | Unique, nullable            | User’s email address.                        |
| `username`             | varchar   | Unique, nullable            | User’s chosen username.                      |
| `password`             | varchar   | Not null                    | Bcrypt-hashed user password.                 |
| `refreshToken`         | varchar   | Nullable                    | Token used for JWT refresh.                  |
| `passkey`              | varchar   | Nullable                    | Secure random string for password reset.     |
| `passkeyExpiresAt`     | timestamp | Nullable                    | Expiry date/time for the current passkey.    |
| `hasSecurityQuestions` | boolean   | Default: `false`            | Whether the user has recovery questions set. |
| `isActive`             | boolean   | Default: `true`             | Indicates if the account is active.          |
| `createdAt`            | timestamp | Auto-generated              | When the user was created.                   |
| `updatedAt`            | timestamp | Auto-updated                | When the user was last updated.              |

---

### 🧩 Relationships

- **1:1 → UserPreferences**
- **1:N → UserSecurityQuestion**
- **1:N → UserSession**
- **1:N → PasswordResetLog**
- (Other app-level relations: Transactions, Budgets, Reports, etc.)

---

### 📝 Notes

- Either `email` or `username` is required during registration.
- Passwords and answers are hashed with **bcrypt**.
- `passkey` regenerates automatically after each password reset.
- `isActive` can be used for soft user suspension.

---

## 🧱 **2. user_preferences**

### 📘 Purpose

Stores user-specific interface and backend settings, such as themes, layouts, or notification preferences.

### 📄 Table Schema

| Column     | Type    | Constraints                 | Description                                    |
| ---------- | ------- | --------------------------- | ---------------------------------------------- |
| `id`       | integer | Primary key, auto-increment | Unique record identifier.                      |
| `user_id`  | integer | Foreign key → `users.id`    | Linked user account.                           |
| `frontend` | json    | Default `{}`                | UI preferences (themes, layouts, etc.).        |
| `backend`  | json    | Default `{}`                | Backend preferences (notifications, behavior). |

---

### 🧩 Relationships

- **1:1 ← users**

---

### 📝 Notes

- Deleted automatically when the user is removed (`onDelete: CASCADE`).
- Serves as a flexible extension for app customization.

---

## 🧱 **3. user_security_questions**

### 📘 Purpose

Contains user-defined recovery questions and their hashed answers, used for password recovery when the passkey is lost.

### 📄 Table Schema

| Column       | Type      | Constraints                 | Description                     |
| ------------ | --------- | --------------------------- | ------------------------------- |
| `id`         | integer   | Primary key, auto-increment | Unique question identifier.     |
| `user_id`    | integer   | Foreign key → `users.id`    | The user who owns the question. |
| `question`   | varchar   | Not null                    | Custom recovery question.       |
| `answerHash` | varchar   | Not null                    | Bcrypt-hashed recovery answer.  |
| `createdAt`  | timestamp | Auto-generated              | Question creation timestamp.    |
| `updatedAt`  | timestamp | Auto-updated                | Last update timestamp.          |

---

### 🧩 Relationships

- **N:1 ← users**

---

### 📝 Notes

- Each user can have **1–3** active questions.
- CRUD operations are available for user management.
- Used exclusively for password recovery validation.

---

## 🧱 **4. user_sessions**

### 📘 Purpose

Tracks active login sessions and refresh tokens for users, supporting multi-device management and secure logout.

### 📄 Table Schema

| Column         | Type      | Constraints                 | Description                      |
| -------------- | --------- | --------------------------- | -------------------------------- |
| `id`           | integer   | Primary key, auto-increment | Unique session identifier.       |
| `user_id`      | integer   | Foreign key → `users.id`    | Linked user.                     |
| `refreshToken` | varchar   | Nullable                    | JWT refresh token hash.          |
| `userAgent`    | varchar   | Nullable                    | Device/browser information.      |
| `ipAddress`    | varchar   | Nullable                    | IP address used for the session. |
| `expiresAt`    | timestamp | Nullable                    | When the session/token expires.  |
| `createdAt`    | timestamp | Auto-generated              | Session creation time.           |

---

### 🧩 Relationships

- **N:1 ← users**

---

### 📝 Notes

- Supports **multi-session authentication**.
- Helps implement “log out of all devices” and audit features.
- Optionally store refresh tokens hashed for extra security.

---

## 🧱 **5. password_reset_logs**

### 📘 Purpose

Records password reset attempts for audit, rate limiting, and security monitoring.

### 📄 Table Schema

| Column      | Type      | Constraints                 | Description                            |
| ----------- | --------- | --------------------------- | -------------------------------------- |
| `id`        | integer   | Primary key, auto-increment | Unique log entry.                      |
| `user_id`   | integer   | Foreign key → `users.id`    | The user attempting the reset.         |
| `method`    | varchar   | Not null                    | `'passkey'` or `'security_questions'`. |
| `success`   | boolean   | Default `false`             | Whether the reset was successful.      |
| `createdAt` | timestamp | Auto-generated              | Timestamp of the attempt.              |

---

### 🧩 Relationships

- **N:1 ← users**

---

### 📝 Notes

- Enables tracking of reset activity for monitoring and throttling.
- Useful for suspicious activity detection.

---

## ✅ **Summary of Tables**

| Table Name                | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `users`                   | Core user credentials and authentication data |
| `user_preferences`        | User interface and backend customization      |
| `user_security_questions` | Recovery questions and hashed answers         |
| `user_sessions`           | Tracks login sessions and refresh tokens      |
| `password_reset_logs`     | Auditable history of password reset attempts  |

---

## ⚙️ **Additional Implementation Notes**

- **Hashing:** All sensitive data (`password`, `answerHash`, `refreshToken`) should be stored using **bcrypt** or a similar algorithm.
- **Security:**

  - `passkey` should be randomly generated and replaced after every use.
  - Limit reset attempts (using logs) to prevent brute force attacks.

- **Cascade Rules:**

  - Deleting a user should cascade delete related preferences, questions, sessions, and logs.

- **Indexes:**

  - `users.username`, `users.email` → unique indexes
  - Foreign keys (`user_id`) → indexed for performance

---

Would you like me to now generate the **TypeORM entity files** for all 5 of these tables (with relations and decorators, matching this doc)?
They’ll align perfectly with your current project architecture.
