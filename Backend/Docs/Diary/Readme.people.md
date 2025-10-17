# People Entity

Represents a person associated with a user. This entity is used to track interactions and personal details of contacts, friends, or other relevant individuals.

## Table: `people`

| Column Name       | Type      | Constraints / Notes                                       |
| ----------------- | --------- | --------------------------------------------------------- |
| id                | number    | Primary Key, auto-generated                               |
| user_id           | number    | Owner user ID, references the `user` who owns this person |
| first_name        | string    | Required                                                  |
| last_name         | string    | Required                                                  |
| email             | string    | Optional, nullable                                        |
| phone             | string    | Optional, nullable                                        |
| address           | string    | Optional, nullable                                        |
| emergency_contact | string    | Optional, nullable                                        |
| birthday          | date      | Optional, nullable                                        |
| notes             | text      | Optional, nullable                                        |
| created_at        | timestamp | Automatically set when record is created                  |
| updated_at        | timestamp | Automatically updated on record modification              |

## Relationships

| Relation Type | Related Entity | Field / Notes                                            |
| ------------- | -------------- | -------------------------------------------------------- |
| One-to-Many   | Interactions   | `Interactions` — all interactions related to this person |

## Endpoints

| Method | Route         | Description                                                | Request Body / Params                                                                                                                                                                                                                                         | Response Type           |
| ------ | ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| POST   | `/people`     | Create a new person associated with the authenticated user | **Payload (CreatePeopleDto):** <br>`json { "first_name": "John", "last_name": "Doe", "email": "john@example.com", "phone": "1234567890", "address": "123 Street", "emergency_contact": "Jane Doe", "birthday": "1990-01-01", "notes": "Friend from school" }` | `ApiResponse<People>`   |
| GET    | `/people`     | Retrieve a list of all people for the authenticated user   | No body, uses authenticated user via JWT                                                                                                                                                                                                                      | `ApiResponse<People[]>` |
| GET    | `/people/:id` | Retrieve details of a single person by ID                  | `id` (path param, number)                                                                                                                                                                                                                                     | `ApiResponse<People>`   |
| PATCH  | `/people/:id` | Update a person's details by ID                            | **Payload (UpdatePeopleDto, partial fields allowed):** <br>`json { "first_name": "Jane", "phone": "0987654321" }`                                                                                                                                             | `ApiResponse<People>`   |
| DELETE | `/people/:id` | Delete a person by ID                                      | `id` (path param, number)                                                                                                                                                                                                                                     | `ApiResponse<null>`     |

## Notes

- **Authentication**:
  - All endpoints are protected using `@UseGuards(AuthGuard('jwt'))`.
- **Decorator Usage**:
  - `@GetUser()` extracts the authenticated user to ensure operations are scoped to the owner.
- **Response Format**:
  - All endpoints return an `ApiResponse` object with fields:
    - `success`: boolean
    - `message`: string
    - `data`: entity or list of entities
    - `meta` (optional for lists): pagination info
- **Validation**:
  - `@Param('id', ParseIntPipe)` ensures `id` parameters are integers.
