Perfect — here’s a **clean, professional, and structured API documentation** for your **Auth module** including **passkey** and **security question** flows, following your given format and using your `ApiResponse<T>` standard.

---

# 🔐 Auth Module API Documentation

**Base URL:** `/auth`

Handles **user registration, login, session management**, and **password reset via passkey or security questions**.

---

## 🔁 Relationships Overview

```
User ── 1 ─── 1 ──▶ UserPreferences
User ── 1 ─── * ──▶ UserSession
User ── 1 ─── 1 ──▶ UserPasskey
User ── 1 ─── * ──▶ SecurityQuestion
```

---

## 📘 Endpoints Overview

| Endpoint                       | Method | Description                                | Payload / Query DTO         |
| :----------------------------- | :----- | :----------------------------------------- | :-------------------------- |
| `/auth/signup`                 | POST   | Register new user                          | `AuthCredentialsDto`        |
| `/auth/signin`                 | POST   | Login and get JWT tokens                   | `SigninDto`                 |
| `/auth/refresh`                | POST   | Refresh access token                       | -                           |
| `/auth/logout`                 | POST   | Logout and clear refresh token             | -                           |
| `/auth/me`                     | GET    | Get current user profile                   | -                           |
| `/auth/me`                     | PATCH  | Update user profile                        | `UpdateProfileDto`          |
| `/auth/me/preferences`         | PATCH  | Update user preferences                    | `UpdatePreferencesDto`      |
| `/auth/passkey`                | GET    | Get current user’s active passkey          | -                           |
| `/auth/passkey/reset`          | POST   | Reset password using passkey               | `PasskeyResetDto`           |
| `/auth/security-questions`     | GET    | Get all user-defined security questions    | -                           |
| `/auth/security-questions`     | POST   | Create new security question               | `CreateSecurityQuestionDto` |
| `/auth/security-questions/:id` | PATCH  | Update existing question                   | `UpdateSecurityQuestionDto` |
| `/auth/security-questions/:id` | DELETE | Delete existing question                   | -                           |
| `/auth/forgot/questions`       | GET    | Fetch security questions for verification  | `ForgotPasswordQueryDto`    |
| `/auth/forgot/verify`          | POST   | Verify security answers and reset password | `ForgotPasswordAnswerDto`   |

---

## 🧾 DTOs

---

### **AuthCredentialsDto (Signup)**

```json
{
  "username": "john_doe",
  "password": "StrongP@ssw0rd!"
}
```

| Field    | Type   | Required | Notes                                     |
| :------- | :----- | :------- | :---------------------------------------- |
| username | string | ✅       | Must be unique                            |
| password | string | ✅       | 6–50 chars, must include mixed characters |

📤 **Response (`ApiResponse<User & Passkey>`):**

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { "id": 1, "username": "john_doe" },
    "passkey": "XYT-49GHK-P1L9"
  }
}
```

---

### **SigninDto (Login)**

```json
{
  "username": "john_doe",
  "password": "StrongP@ssw0rd!"
}
```

📤 **Response:**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

---

### **UpdateProfileDto (PATCH `/auth/me`)**

```json
{
  "email": "john_new@example.com",
  "username": "johnny_d"
}
```

---

### **UpdatePreferencesDto**

```json
{
  "frontend": { "theme": "dark" },
  "backend": { "notifications": true }
}
```

---

### **PasskeyResetDto**

Used to reset password using a valid passkey.

```json
{
  "passkey": "XYT-49GHK-P1L9",
  "newPassword": "NewP@ssw0rd123"
}
```

📤 **Response:**

```json
{
  "success": true,
  "message": "Password reset successfully. New passkey generated.",
  "data": {
    "newPasskey": "ZQJ-99LMN-K8P2"
  }
}
```

---

### **CreateSecurityQuestionDto**

```json
{
  "question": "What was your first school?",
  "answer": "Sunrise High"
}
```

---

### **UpdateSecurityQuestionDto**

```json
{
  "question": "What city were you born in?",
  "answer": "Dhaka"
}
```

---

### **ForgotPasswordQueryDto**

Used to fetch a user’s questions (by username).

```json
{
  "username": "john_doe"
}
```

📤 **Response:**

```json
{
  "success": true,
  "message": "Security questions fetched.",
  "data": [
    { "id": 1, "question": "What was your first school?" },
    { "id": 2, "question": "Your favorite book?" },
    { "id": 3, "question": "Your childhood nickname?" }
  ]
}
```

---

### **ForgotPasswordAnswerDto**

Used to verify answers and set a new password.

```json
{
  "username": "john_doe",
  "answers": [
    { "questionId": 1, "answer": "Sunrise High" },
    { "questionId": 2, "answer": "Harry Potter" },
    { "questionId": 3, "answer": "Johnny" }
  ],
  "newPassword": "NewP@ssword!"
}
```

📤 **Response:**

```json
{
  "success": true,
  "message": "Password reset successful. New passkey generated.",
  "data": {
    "newPasskey": "KDJ-77XYZ-A3Q4"
  }
}
```

---

## 🧠 Notes

- All endpoints except:

  - `/signup`
  - `/signin`
  - `/forgot/*`
  - `/auth/passkey/reset`

  require a valid **JWT**.

- **Passkey resets** invalidate all previous sessions for security.

- **Security questions** must have **3 unique entries** per user.

- **Answers** are stored **hashed** (similar to passwords).

- A new **passkey** is automatically generated after each successful password reset.

---

Would you like me to generate the corresponding **NestJS DTO and Controller method stubs** next (for clean implementation)?
