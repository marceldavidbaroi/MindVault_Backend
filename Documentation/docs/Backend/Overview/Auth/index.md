# Auth Module

The **Auth Module** handles all **user authentication and authorization** processes in the system.  
Its purpose is to ensure secure access, manage user sessions, and provide profile management features.

---

## Key Responsibilities

- **User Registration (Signup)** – allows new users to create an account.
- **User Login (Signin)** – verifies credentials and issues access/refresh tokens.
- **Token Management** – handles JWT access tokens and refresh tokens stored in cookies.
- **Logout** – clears tokens and invalidates active sessions.
- **User Profile** – provides endpoints to fetch and update user details.
- **User Preferences** – manages frontend/backend user-specific settings.

---

## Purpose

This module ensures that only authenticated and authorized users can access protected resources.  
It provides a secure foundation for **identity, session management, and personalization** across the system.
