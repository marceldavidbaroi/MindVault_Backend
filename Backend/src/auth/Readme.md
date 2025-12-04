# Auth & User Module

This module provides full authentication, authorization, and user profile management functionality for the application, including JWT-based login, password reset (via passkey or security questions), profile and preferences management, and security questions.

---

## Table of Contents

- [Entities](#entities)
- [Authentication Flow](#authentication-flow)
- [Services](#services)
- [DTOs](#dtos)
- [API Endpoints](#api-endpoints)
- [Passkey & Security](#passkey--security)
- [Preferences](#preferences)

---

## Entities

### User

- Stores user credentials, status, and relations to preferences, sessions, transactions, categories, accounts, and roles.
- Key fields:
  - `id`, `username`, `email`, `password`, `passkey`, `refreshToken`
  - `hasSecurityQuestions`, `isActive`
- Relations:
  - `preferences` (1:1)
  - `securityQuestions` (1:N)
  - `sessions` (1:N)
  - `passwordResetLogs` (1:N)
  - `accounts`, `categories`, `transactions`, `accountRoles` (1:N)

### UserPreferences

- Stores frontend/backend preferences as JSON objects.
- Relations:
  - Belongs to `User` (1:1)

### UserSecurityQuestion

- Stores hashed answers for security questions.
- Relations:
  - Belongs to `User` (N:1)

### UserSession

- Tracks user sessions with JWT refresh tokens, IP, and user-agent.
- Relations:
  - Belongs to `User` (N:1)

### PasswordResetLog

- Logs password reset attempts with method and success status.
- Relations:
  - Belongs to `User` (N:1)
- Methods: `'passkey' | 'security_questions' | 'manual'`

---

## Authentication Flow

### Signup

- Endpoint: `POST /auth/signup`
- Generates a hashed password and a passkey.
- Creates default `UserPreferences`.
- Returns a `passkey` for backup authentication.

### Signin

- Endpoint: `POST /auth/signin`
- Validates username/password.
- Creates a `UserSession` with hashed refresh token.
- Returns `accessToken` and `refreshToken` as HttpOnly cookies.

### Refresh Token

- Endpoint: `POST /auth/refresh`
- Validates existing refresh token against `UserSession`.
- Issues new `accessToken` and `refreshToken`.

### Logout

- Endpoint: `POST /auth/logout`
- Deletes session(s) and clears cookies.

---

## Services

| Service                   | Responsibility                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| `AuthService`             | Signup, Signin, Refresh Token, Logout                                |
| `ForgotPasswordService`   | Fetch security questions, verify answers, reset password             |
| `PasskeyService`          | Retrieve passkey, reset password via passkey, manual password change |
| `ProfileService`          | Get/update profile, update preferences                               |
| `SecurityQuestionService` | CRUD operations for security questions                               |
| `VerifyUserService`       | Validate user existence by `id` or `username`                        |

---

## DTOs

### Auth / Credentials

- `authCredentialsDto` → Signup credentials
- `SigninDto` → Signin credentials
- `ChangePasswordDto` → Change password

### Profile & Preferences

- `UpdateProfileDto` → Update user profile
- `FrontendPreferencesDto` → UI preferences
- `BackendPreferencesDto` → Backend preferences
- `UpdatePreferencesDto` → Combined frontend & backend updates

### Security Questions

- `CreateSecurityQuestionDto` → Create question
- `UpdateSecurityQuestionDto` → Update question
- `DeleteSecurityQuestionDto` → Delete question
- `FetchForgotQuestionsDto` → Get questions for forgot-password
- `VerifyForgotAnswersDto` → Verify answers for password reset

### Passkey

- `GetPasskeyDto` → Request passkey with password
- `ResetPasswordWithPasskeyDto` → Reset password using passkey
- `SafeUserDto` → Safe user representation for API responses

---

## API Endpoints (Examples)

| Method | Endpoint                 | Description                                |
| ------ | ------------------------ | ------------------------------------------ |
| POST   | `/auth/signup`           | Create a new user                          |
| POST   | `/auth/signin`           | Authenticate user and set cookies          |
| POST   | `/auth/refresh`          | Refresh access token using refresh token   |
| POST   | `/auth/logout`           | Logout user and delete session(s)          |
| GET    | `/auth/passkey`          | Get current passkey (requires password)    |
| POST   | `/auth/passkey/reset`    | Reset password using passkey               |
| POST   | `/auth/forgot/questions` | Get security questions for a username      |
| POST   | `/auth/forgot/verify`    | Verify security answers and reset password |
| GET    | `/profile`               | Get current user profile and preferences   |
| PATCH  | `/profile`               | Update profile info                        |
| PATCH  | `/profile/preferences`   | Update frontend/backend preferences        |
| GET    | `/security-questions`    | List user's security questions             |
| POST   | `/security-questions`    | Create a security question                 |
| PATCH  | `/security-questions`    | Update a security question                 |
| DELETE | `/security-questions`    | Delete a security question                 |

---

## Passkey & Security

- Passkeys are generated with `uuid` segments (e.g., `AB12-CD34-EF56`) for secure, unique resets.
- Password reset methods:
  1. **Passkey**: user provides passkey.
  2. **Security Questions**: user answers pre-set questions.
  3. **Manual Change**: user logged in, changes password with old password.

- Each password reset is logged in `PasswordResetLog` with method and success status.

---

## Preferences

- **Frontend preferences**: theme, layout, and custom extra options.
- **Backend preferences**: notifications and additional settings.
- Stored as JSON objects in `UserPreferences`.

---

## Notes

- Passwords are hashed using `bcrypt`.
- JWT `accessToken` expires in 1 hour; `refreshToken` in 7 days.
- Services follow **NestJS Dependency Injection** and use `TypeORM` ActiveRecord/Repository patterns.
- All sensitive fields (`password`, `refreshToken`, `passkey`) are excluded from API responses.

---
