# Auth

This document describes the main database entities for the application, their table structures, relations, and purpose.

---

## **User**

**Description:**  
Stores the main user account information including authentication, security, preferences, and related financial data.

| Column               | Type                     | Nullable | Default        | Description                             |
| -------------------- | ------------------------ | -------- | -------------- | --------------------------------------- |
| id                   | integer                  | No       | auto-generated | Primary key                             |
| email                | string                   | Yes      |                | User email, unique                      |
| username             | string                   | Yes      |                | Username, unique                        |
| password             | string                   | No       |                | Hashed password                         |
| refreshToken         | string                   | Yes      |                | Token for session refresh               |
| passkey              | string                   | Yes      |                | Key for password reset                  |
| passkeyExpiresAt     | timestamp with time zone | Yes      |                | Expiration date of passkey              |
| hasSecurityQuestions | boolean                  | No       | false          | Whether user has set security questions |
| isActive             | boolean                  | No       | true           | Whether the account is active           |
| createdAt            | timestamp with time zone | No       | auto-generated | Record creation timestamp               |
| updatedAt            | timestamp with time zone | No       | auto-generated | Record update timestamp                 |

**Relations:**

- `securityQuestions`: OneToMany → `UserSecurityQuestion`
- `passwordResetLogs`: OneToMany → `PasswordResetLog`
- `sessions`: OneToMany → `UserSession`
- `preferences`: OneToOne → `UserPreferences` (cascade)
- `transactions`: OneToMany → `Transactions`
- `budgets`: OneToMany → `Budgets`
- `savingsGoals`: OneToMany → `SavingsGoals`
- `reports`: OneToMany → `Reports`
- `categories`: OneToMany → `Category`
- `dailySummaries`: OneToMany → `DailySummary`
- `monthlySummaries`: OneToMany → `MonthlySummary`
- `monthlyCategorySummaries`: OneToMany → `MonthlyCategorySummary`
- `accountTypes`: OneToMany → `AccountType`
- `accounts`: OneToMany → `Account`

---

## **UserSession**

**Description:**  
Stores session information for users, including refresh tokens, user agent, IP, and expiry.

| Column       | Type      | Nullable | Default        | Description               |
| ------------ | --------- | -------- | -------------- | ------------------------- |
| id           | integer   | No       | auto-generated | Primary key               |
| userId       | integer   | No       |                | Foreign key to `User`     |
| refreshToken | string    | Yes      |                | Refresh token for session |
| userAgent    | string    | Yes      |                | Browser/user agent info   |
| ipAddress    | string    | Yes      |                | IP address of user        |
| expiresAt    | timestamp | Yes      |                | Expiry of session         |
| createdAt    | timestamp | No       | auto-generated | Creation timestamp        |

**Relations:**

- `user`: ManyToOne → `User` (onDelete: CASCADE)

---

## **UserSecurityQuestion**

**Description:**  
Stores security questions and hashed answers for account recovery.

| Column     | Type      | Nullable | Default        | Description            |
| ---------- | --------- | -------- | -------------- | ---------------------- |
| id         | integer   | No       | auto-generated | Primary key            |
| userId     | integer   | No       |                | Foreign key to `User`  |
| question   | string    | No       |                | Security question text |
| answerHash | string    | No       |                | Hashed answer          |
| createdAt  | timestamp | No       | auto-generated | Creation timestamp     |
| updatedAt  | timestamp | No       | auto-generated | Last update timestamp  |

**Relations:**

- `user`: ManyToOne → `User` (onDelete: CASCADE)

---

## **UserPreferences**

**Description:**  
Stores user-specific frontend and backend preferences (themes, layouts, notifications, etc).

| Column   | Type    | Nullable | Default        | Description                 |
| -------- | ------- | -------- | -------------- | --------------------------- |
| id       | integer | No       | auto-generated | Primary key                 |
| userId   | integer | No       |                | Foreign key to `User`       |
| frontend | JSON    | No       | {}             | UI-related preferences      |
| backend  | JSON    | No       | {}             | Backend-related preferences |

**Relations:**

- `user`: OneToOne → `User` (onDelete: CASCADE)

---

## **PasswordResetLog**

**Description:**  
Logs password reset attempts, including method, success, IP, and notes.

| Column    | Type                                          | Nullable | Default        | Description                    |
| --------- | --------------------------------------------- | -------- | -------------- | ------------------------------ |
| id        | integer                                       | No       | auto-generated | Primary key                    |
| userId    | integer                                       | No       |                | Foreign key to `User`          |
| method    | enum('passkey','security_questions','manual') | No       |                | Method used for password reset |
| success   | boolean                                       | No       | false          | Whether reset was successful   |
| ipAddress | string                                        | Yes      |                | IP address of attempt          |
| note      | string                                        | Yes      |                | Optional note                  |
| createdAt | timestamp                                     | No       | auto-generated | Attempt creation timestamp     |

**Relations:**

- `user`: ManyToOne → `User` (onDelete: CASCADE)

---
