# Tags

**Base URL:** `/tags`  
All endpoints require **JWT authentication**.  
System tags (`is_system = TRUE`) are **read-only** and cannot be edited or deleted.

---

## Endpoints

| Endpoint       | Method | Description                     | Payload / Query DTO |
| -------------- | ------ | ------------------------------- | ------------------- |
| `/tags`        | POST   | Create a new user-defined tag   | `CreateTagDto`      |
| `/tags`        | GET    | List tags with optional filters | `FindTagsDto`       |
| `/tags/:id`    | GET    | Get a single tag by ID          | -                   |
| `/tags/:id`    | PATCH  | Update a user-defined tag       | `UpdateTagDto`      |
| `/tags/:id`    | DELETE | Delete a user-defined tag       | -                   |
| `/tags/system` | GET    | Get all system-defined tags     | -                   |

---

## DTOs

### CreateTagDto

**Example JSON:**

```json
{
  "name": "Friends",
  "module_name": "contacts",
  "color": "#4ECDC4",
  "description": "Personal friends"
}
```

````

| Field       | Type   | Required | Notes                                          |
| ----------- | ------ | -------- | ---------------------------------------------- |
| name        | string | ✅       | Tag label/name                                 |
| module_name | string | ✅       | Submodule this tag belongs to (e.g., contacts) |
| color       | string | ❌       | Optional hex color for UI                      |
| description | string | ❌       | Optional description                           |

---

### UpdateTagDto

**Example JSON:**

```json
{
  "name": "Close Friends",
  "color": "#00CED1",
  "description": "Very close personal friends"
}
```

| Field       | Type   | Required | Notes                        |
| ----------- | ------ | -------- | ---------------------------- |
| name        | string | ❌       | Update tag name if needed    |
| color       | string | ❌       | Update color if needed       |
| description | string | ❌       | Update description if needed |

---

### FindTagsDto (Query)

**Example Query:**

```
GET /tags?module_name=contacts&include_system=true&page=1&limit=25
```

| Field          | Type    | Default | Optional | Notes                                       |
| -------------- | ------- | ------- | -------- | ------------------------------------------- |
| module_name    | string  | -       | ✅       | Filter tags by module name (e.g., contacts) |
| include_system | boolean | true    | ✅       | Include system tags in the results          |
| page           | number  | 1       | ✅       | Pagination page                             |
| limit          | number  | 25      | ✅       | Items per page (max 100)                    |

---

### Notes

- **System tags** have `user_id = NULL` and `is_system = TRUE`.
- Users can create custom tags with `user_id = <their UUID>`.
- Tags are assigned to modules via `module_name` (e.g., `"contacts"`).
- System tags cannot be edited or deleted.
- Optional: Bulk assign tags to contacts via `/contacts/:id/tags` endpoint (not included here).

```

```
````
