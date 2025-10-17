Here is the information formatted in Markdown.

# Auth

**Base URL:** `/auth`

Handles **user authentication, authorization, and profile management**.

---

## Endpoints

| Endpoint               | Method | Description                         | Payload / Query DTO    |
| :--------------------- | :----- | :---------------------------------- | :--------------------- |
| `/auth/signup`         | POST   | Register a new user                 | `AuthCredentialsDto`   |
| `/auth/signin`         | POST   | Login user and return tokens        | `SigninDto`            |
| `/auth/refresh`        | POST   | Refresh access token from cookie    | -                      |
| `/auth/logout`         | POST   | Logout user and clear refresh token | -                      |
| `/auth/me`             | GET    | Get user profile (JWT required)     | -                      |
| `/auth/me`             | PATCH  | Update user profile                 | `Partial<User>`        |
| `/auth/me/preferences` | PATCH  | Update user preferences             | `UpdatePreferencesDto` |

---

## DTOs

### AuthCredentialsDto (Signup)

**Example JSON:**

```json
{
  "username": "john_doe",
  "password": "StrongP@ssw0rd!"
}
```

| Field    | Type   | Required | Notes                                                                 |
| :------- | :----- | :------- | :-------------------------------------------------------------------- |
| username | string | ✅       | 3–20 characters, must be unique                                       |
| password | string | ✅       | 6–50 chars, must include uppercase, lowercase, number, special symbol |

---

### SigninDto (Login)

**Example JSON:**

```json
{
  "username": "john_doe",
  "password": "StrongP@ssw0rd!"
}
```

| Field    | Type   | Required | Notes                        |
| :------- | :----- | :------- | :--------------------------- |
| username | string | ✅       | Must match an existing user  |
| password | string | ✅       | No regex check, plain string |

---

### UpdateProfile (PATCH `/auth/me`)

**Example JSON:**

```json
{
  "email": "new_email@example.com",
  "username": "new_username"
}
```

| Field    | Type   | Required | Notes                      |
| :------- | :----- | :------- | :------------------------- |
| email    | string | ❌       | Must be unique if provided |
| username | string | ❌       | Must be unique if provided |

---

### UpdatePreferencesDto (PATCH `/auth/me/preferences`)

**Example JSON:**

```json
{
  "frontend": { "theme": "dark" },
  "backend": { "notifications": true }
}
```

| Field    | Type   | Required | Notes                      |
| :------- | :----- | :------- | :------------------------- |
| frontend | object | ❌       | Arbitrary JSON preferences |
| backend  | object | ❌       | Arbitrary JSON preferences |

---

## Notes

- All endpoints except `/signup`, `/signin`, and `/refresh` require **JWT authentication**.
- The **refresh token** is stored in cookies and cleared on `/logout`.
- Passwords are always stored **hashed** in the database.
