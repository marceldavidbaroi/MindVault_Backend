# Roles Module

## Overview

The Roles module manages **user roles**, including their creation, retrieval, and association with accounts.  
It defines role properties such as `name`, `displayName`, and `description`, and supports role-based access control across the system.

---

## Endpoints

| Method | Route      | Description             | Auth Required | Roles / Permissions |
| ------ | ---------- | ----------------------- | ------------- | ------------------- |
| GET    | /roles     | List all roles          | ✅            | user/admin          |
| GET    | /roles/:id | Get a single role by ID | ✅            | user/admin          |
| POST   | /roles     | Create a new role       | ✅            | admin               |
| PUT    | /roles/:id | Update a role           | ✅            | admin               |
| DELETE | /roles/:id | Delete a role           | ✅            | admin               |

> 🔹 Currently, only the `GET` endpoints are implemented. POST, PUT, DELETE are scaffolded but commented out.

---

## Business Logic / Rules

- **Validation rules**: `name` is required; `displayName` and `description` are optional.
- **Role-based access**: Only authorized users can access endpoints; admin permissions are required for modification.
- **Edge cases**:
  - `findOne(id)` throws `NotFoundException` if the role does not exist.
  - Deletion or update operations are not yet active in the current code.
- **Seeding**: Default roles (`owner`, `admin`, `editor`, `viewer`) are seeded using `RolesSeeder`.

---

## Entities / Relationships

| Entity | Relation Type | Notes                                                         |
| ------ | ------------- | ------------------------------------------------------------- |
| Role   | OneToMany     | Each role can be linked to multiple `AccountUserRole` entries |

---

## DTOs (Data Transfer Objects)

| DTO Name      | Purpose                       |
| ------------- | ----------------------------- |
| CreateRoleDto | For creating a new role       |
| UpdateRoleDto | For updating an existing role |

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

Example for `GET /roles`:

```ts
{
  success: true,
  message: 'Roles fetched successfully.',
  data: [
    {
      id: 1,
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full administrative access'
    },
    ...
  ]
}
```

---

## Seeder

The `RolesSeeder` handles populating default roles:

- `owner` – Full access to everything
- `admin` – Admin privileges
- `editor` – Can edit content
- `viewer` – Read-only access

Command to run seeder:

```bash
npm run seed:roles
```

---
