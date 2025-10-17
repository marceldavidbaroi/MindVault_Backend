# Auth Module Documentation

## Overview

This module handles user management, authentication, preferences, interactions, and transactions.  
It includes the `User` and `UserPreferences` entities, along with authentication endpoints for signup, signin, token refresh, logout, and profile management.

Key features:

- Secure authentication using JWT and refresh tokens
- User profile and preferences management
- Tracking of interactions and financial transactions

---

# User Entity

Represents a user in the system, storing authentication details, preferences, interactions, and transactions.

## Table: `user`

| Column Name  | Type      | Constraints / Notes                                                |
| ------------ | --------- | ------------------------------------------------------------------ |
| id           | number    | Primary Key, auto-generated                                        |
| email        | string    | Unique, nullable                                                   |
| username     | string    | Unique, required                                                   |
| password     | string    | Required                                                           |
| created_at   | timestamp | Defaults to current timestamp when record is created               |
| updated_at   | timestamp | Defaults to current timestamp, auto-updates on record modification |
| refreshToken | string    | Nullable                                                           |

## Relationships

| Relation Type        | Related Entity  | Field / Notes                                         |
| -------------------- | --------------- | ----------------------------------------------------- |
| One-to-Many          | Interactions    | `interactions` — all interactions related to the user |
| One-to-One (cascade) | UserPreferences | `preferences` — user's preferences, cascades on save  |
| One-to-Many          | Transactions    | `transactions` — all transactions related to the user |

---

# UserPreferences Entity

Represents a user's preferences, including frontend (UI) and backend (API/settings) configurations.

## Table: `user_preferences`

| Column Name | Type   | Constraints / Notes                                                                     |
| ----------- | ------ | --------------------------------------------------------------------------------------- |
| id          | number | Primary Key, auto-generated                                                             |
| userId      | number | Foreign Key referencing `user.id`, cascades on delete                                   |
| frontend    | json   | Stores UI-related preferences (themes, layouts), defaults to empty object `{}`          |
| backend     | json   | Stores backend preferences (notifications, API settings), defaults to empty object `{}` |

## Relationships

| Relation Type        | Related Entity | Field / Notes                                                |
| -------------------- | -------------- | ------------------------------------------------------------ |
| One-to-One (cascade) | User           | `user` — linked user, deletes preferences if user is deleted |

---

# AuthController Endpoints

Manages user authentication, token handling, and profile/preference updates.

| Method | Route             | Description                                                            | Request Body / Params                            | Response                                       |
| ------ | ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| POST   | `/signup`         | Registers a new user                                                   | `AuthCredentailsDto` (username, email, password) | `{ message: string }`                          |
| POST   | `/signin`         | Authenticates user and issues access token and refresh token in cookie | `SigninDto` (username/email, password)           | `{ user: Partial<User>, accessToken: string }` |
| POST   | `/refresh`        | Refreshes access token using refresh token from cookies                | Cookies: `refreshToken`                          | `{ accessToken: string }`                      |
| POST   | `/logout`         | Logs out the user, clears refresh token cookie and DB entry            | Authenticated user via JWT                       | `void`                                         |
| GET    | `/me`             | Retrieves current authenticated user profile                           | Authenticated user via JWT                       | User profile object                            |
| PATCH  | `/me`             | Updates current authenticated user's profile                           | Partial<User> object with update fields          | Updated user profile object                    |
| PATCH  | `/me/preferences` | Updates current authenticated user's preferences                       | `{ frontend?: any; backend?: any }`              | Updated preferences object                     |

## Notes

- **Authentication**:
  - `@UseGuards(AuthGuard('jwt'))` protects endpoints requiring a valid JWT.
- **Cookies**:
  - `refreshToken` is used for access token refresh.
- **Decorators**:
  - `@GetUser()` extracts the authenticated user from the request context.
  - `@Res({ passthrough: true })` allows setting cookies without terminating the response.
- **DTOs**:
  - `AuthCredentailsDto` — fields required for signup (username, email, password).
  - `SigninDto` — fields required for signin (username/email, password).
