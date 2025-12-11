# Tags Module

## Overview

Manages **tags** and **tag groups** for categorization and filtering.
Supports user-defined and system-defined tags/groups, with full CRUD, soft/hard delete, restore, and search capabilities.
System tags/groups are **immutable**; users can only manage their own.

---

## Endpoints

### Tag Groups

| Method | Route                    | Description                      | Auth Required | Roles / Permissions                     |
| ------ | ------------------------ | -------------------------------- | ------------- | --------------------------------------- |
| GET    | /tags/groups             | List all tag groups              | ✅            | Any authenticated user                  |
| GET    | /tags/groups/:id         | Get a single tag group by ID     | ✅            | Any authenticated user                  |
| POST   | /tags/groups             | Create a new tag group           | ✅            | Any authenticated user                  |
| PATCH  | /tags/groups/:id         | Update a tag group               | ✅            | Owner only (cannot edit system)         |
| DELETE | /tags/groups/:id         | Soft delete a tag group          | ✅            | Owner only (cannot delete system)       |
| PATCH  | /tags/groups/:id/restore | Restore a soft-deleted tag group | ✅            | Owner only                              |
| DELETE | /tags/groups/:id/force   | Permanently delete a tag group   | ✅            | Owner only (must be soft-deleted first) |

### Tags

| Method | Route             | Description                | Auth Required | Roles / Permissions                     |
| ------ | ----------------- | -------------------------- | ------------- | --------------------------------------- |
| GET    | /tags             | List all tags              | ✅            | Any authenticated user                  |
| GET    | /tags/:id         | Get a single tag by ID     | ✅            | Any authenticated user                  |
| POST   | /tags             | Create a new tag           | ✅            | Any authenticated user                  |
| PATCH  | /tags/:id         | Update a tag               | ✅            | Owner only (cannot edit system)         |
| DELETE | /tags/:id         | Soft delete a tag          | ✅            | Owner only (cannot delete system)       |
| PATCH  | /tags/:id/restore | Restore a soft-deleted tag | ✅            | Owner only                              |
| DELETE | /tags/:id/force   | Permanently delete a tag   | ✅            | Owner only (must be soft-deleted first) |

> 🔹 System-defined tags and groups are seeded and **cannot be modified by users**. Users can create, update, or delete only their own tags/groups.

---

## Business Logic / Rules

- **Validation**:
  - Names must be unique per user.
  - Names must be snake_case.
  - Display names are required, icons and descriptions optional.

- **Soft Delete / Restore**:
  - Soft delete sets `isDeleted = true` and `deletedAt` timestamp.
  - Restore resets `isDeleted = false` and clears `deletedAt`.
  - Hard delete requires the entity to be soft-deleted first.

- **System Tags/Groups**:
  - Immutable; cannot be edited or deleted by users.

- **User Ownership**:
  - Users can only update, delete, or restore their own tags/groups.

- **Search & Pagination**:
  - Search by `name` or `displayName` using `q` query.
  - Pagination via `limit` and `page`.

- **Group Relationships**:
  - Tags optionally belong to a tag group (`groupId`).
  - Cannot delete a group that still has assigned tags.

---

## Entities / Relationships

| Entity   | Relation Type        | Notes                                |
| -------- | -------------------- | ------------------------------------ |
| TagGroup | OneToMany (Tags)     | One group can have multiple tags     |
| Tag      | ManyToOne (TagGroup) | Optional relationship to a tag group |

---

## DTOs (Data Transfer Objects)

| DTO Name          | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| CreateTagGroupDto | For creating a new tag group                   |
| UpdateTagGroupDto | For updating an existing tag group             |
| QueryTagGroupDto  | For querying tag groups (search/pagination)    |
| CreateTagDto      | For creating a new tag                         |
| UpdateTagDto      | For updating an existing tag                   |
| QueryTagDto       | For querying tags (search, filter, pagination) |

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

---

## Notes

- Seeder is available for initial system-defined tags and groups.
- System entities are immutable; only users’ own tags/groups are editable.
- Transformers ensure consistent API response structure.
