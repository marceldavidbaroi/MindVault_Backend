# 📘 Auth Module

## Overview

The **Auth Module** handles all operations related to user authentication and account management.
It supports:

- User registration, login, logout, and session management
- Password management with one-time passkeys and security question recovery
- User profile and preferences management
- Security question CRUD and verification

This module also exposes reusable **validators and utilities** that can be leveraged by other modules.

---

## Endpoints

### **Auth**

| Method | Route                  | Description                               | Auth Required | Roles / Permissions |
| ------ | ---------------------- | ----------------------------------------- | ------------- | ------------------- |
| POST   | `/api/v1/auth/signup`  | Register a new user                       | ❌            | Public              |
| POST   | `/api/v1/auth/signin`  | Login user and set authentication cookies | ❌            | Public              |
| POST   | `/api/v1/auth/refresh` | Refresh access token using refresh token  | ✅            | User                |
| POST   | `/api/v1/auth/logout`  | Logout user and clear cookies             | ✅            | User                |

### **Forgot Password**

| Method | Route                                               | Description                                | Auth Required | Roles / Permissions |
| ------ | --------------------------------------------------- | ------------------------------------------ | ------------- | ------------------- |
| GET    | `/api/v1/auth/forgot-password/{username}/questions` | Fetch security questions for a user        | ❌            | Public              |
| POST   | `/api/v1/auth/forgot-password/{username}/verify`    | Verify security answers and reset password | ❌            | Public              |

### **Passkey Management**

| Method | Route                         | Description                        | Auth Required | Roles / Permissions |
| ------ | ----------------------------- | ---------------------------------- | ------------- | ------------------- |
| POST   | `/api/v1/auth/passkey`        | Fetch current passkey              | ✅            | User                |
| PATCH  | `/api/v1/auth/passkey/reset`  | Reset password using passkey       | ❌            | Public              |
| PATCH  | `/api/v1/auth/passkey/change` | Change password using old password | ✅            | User                |

### **Profile**

| Method | Route                         | Description                             | Auth Required | Roles / Permissions |
| ------ | ----------------------------- | --------------------------------------- | ------------- | ------------------- |
| GET    | `/api/v1/profile`             | Fetch the authenticated user profile    | ✅            | User                |
| PATCH  | `/api/v1/profile`             | Update user profile                     | ✅            | User                |
| PATCH  | `/api/v1/profile/preferences` | Update application preferences for user | ✅            | User                |

### **Security Questions**

| Method | Route                             | Description                                | Auth Required | Roles / Permissions |
| ------ | --------------------------------- | ------------------------------------------ | ------------- | ------------------- |
| GET    | `/api/v1/security-questions`      | Fetch all security questions for the user  | ✅            | User                |
| POST   | `/api/v1/security-questions`      | Create a new security question             | ✅            | User                |
| PATCH  | `/api/v1/security-questions/{id}` | Update an existing security question by ID | ✅            | User                |
| DELETE | `/api/v1/security-questions/{id}` | Delete a security question by ID           | ✅            | User                |

---

## Business Rules / Auth Flow

1. **Signup → Signin → Logout**
   - Users register with email/username and password.
   - Authentication cookies or JWT are issued at login.
   - Logout clears session cookies and invalidates the refresh token.

2. **Password & Recovery**
   - Each user has a **one-time-use passkey** for password reset.
   - After changing a password (via passkey or old password), a **new passkey is generated**.
   - Optional **forgot password flow** uses **3 security questions** for recovery.

3. **Security Questions**
   - Users can create, update, delete, and fetch security questions.
   - Minimum of 3 questions recommended for recovery.

4. **Preferences**
   - Users have `frontend` and `backend` preferences stored in JSON fields.
   - Preferences can be updated independently of the profile.

---

## Entities / Relationships

| Entity               | Relation Type    | Notes                                                                |
| -------------------- | ---------------- | -------------------------------------------------------------------- |
| User                 | BaseEntity       | Holds email, username, password, refreshToken, passkey, status flags |
| UserPreferences      | OneToOne → User  | Stores frontend/backend preferences                                  |
| UserSession          | ManyToOne → User | Tracks refresh tokens, IPs, user agents                              |
| PasswordResetLog     | ManyToOne → User | Tracks password reset attempts, method used, IP address              |
| UserSecurityQuestion | ManyToOne → User | Stores security questions and hashed answers                         |

---

## DTOs (Data Transfer Objects)

| DTO Name                  | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| AuthCredentialsDto        | Login credentials (username/email + password) |
| SignInDto                 | User sign-in                                  |
| ChangePasswordDto         | Change password with old password             |
| ResetPasswordPasskeyDto   | Reset password using passkey                  |
| GetPasskeyDto             | Fetch passkey                                 |
| SafeUserDto               | Sanitized user data                           |
| UpdateProfileDto          | Update user profile                           |
| UpdatePreferencesDto      | Update frontend/backend preferences           |
| CreateSecurityQuestionDto | Add a new security question                   |
| UpdateSecurityQuestionDto | Update an existing security question          |
| DeleteSecurityQuestionDto | Delete a security question                    |
| FetchForgotQuestionsDto   | Fetch security questions for forgot password  |
| VerifyForgotAnswersDto    | Verify answers for password recovery          |
| BackendPreferencesDto     | Backend preference updates                    |
| FrontendPreferencesDto    | Frontend preference updates                   |

---

## Reusable Utilities for Other Modules

| Utility / Validator                                     | Purpose                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| `UserValidator.ensureUserExists(idOrUsername)`          | Ensures a user exists, throws `NotFoundException` if not found  |
| `UserValidator.ensureUserExistsWithPreferences(userId)` | Fetch user with preferences, throws if not found                |
| `PasswordValidator.verifyPassword(user, password)`      | Verifies plaintext password against stored hash                 |
| `generatePasskey()`                                     | Generates a one-time-use passkey for recovery or password reset |

> 🔹 These can be imported and used by **any other module** to validate users or handle passkeys.

---

## Standard Response Format

All endpoints return:

```ts
{
  success: boolean,
  message: string,
  data: any
}
```

Example:

```ts
{
  success: true,
  message: "User logged in successfully",
  data: {
    user: { id: 1, username: "john_doe" },
    accessToken: "jwt_token_here",
    refreshToken: "refresh_token_here"
  }
}
```

---

## Notes for Integration with Other Modules

- Any module needing **user validation** should use `UserValidator`.
- Any module needing **secure password handling** can use `PasswordValidator`.
- Passkeys can be generated using `generatePasskey()` for one-time flows.
- Entities like `User`, `UserPreferences`, and `UserSecurityQuestion` can be imported to establish relationships with other modules (e.g., roles, tasks, or audit logs).

---

## Authentication & Recovery Flow Diagram (Simplified)

1. **SignUp / SignIn** → JWT issued → stored in session / cookies
2. **Logout** → JWT invalidated → session removed
3. **Forgot Password** → Fetch security questions → Verify answers → Reset password → new passkey generated
4. **Passkey Flow** → One-time-use passkey → reset password → new passkey generated
5. **Profile & Preferences** → Fetch / Update → stored in `User` and `UserPreferences`

---

This README fully documents **all aspects of the Auth Module**, including **endpoints, entities, DTOs, reusable utilities, and auth flow**.
