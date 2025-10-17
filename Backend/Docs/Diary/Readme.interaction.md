# Interactions Entity

Represents a logged interaction or event between the user and a person (optional).  
Includes contextual, emotional, reflective, and engagement data for personal journaling or tracking purposes.

## Table: `interactions`

| Column Name      | Type         | Constraints / Notes                                                                                |
| ---------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| id               | number       | Primary Key, auto-generated                                                                        |
| user_id          | number       | Foreign Key referencing `user.id`, required                                                        |
| person_id        | number       | Foreign Key referencing `people.id`, optional                                                      |
| title            | string       | Title of the interaction, required                                                                 |
| date             | timestamp    | Date and time of the interaction, required                                                         |
| description      | text         | Main diary note or description of the interaction, required                                        |
| context          | string       | Optional, e.g., "Met at coffee shop"                                                               |
| medium           | string       | Optional, e.g., in-person, call                                                                    |
| duration_minutes | int          | Optional, duration in minutes                                                                      |
| location         | string       | Optional, location of the interaction                                                              |
| mood             | enum         | Optional, emotional state: `happy`, `excited`, `neutral`, `sad`, `angry`                           |
| energy_level     | int          | Optional, 1–10 scale                                                                               |
| person_mood      | string       | Optional, mood of the other person involved                                                        |
| gratitude_level  | int          | Optional, 1–10 scale                                                                               |
| reflection       | text         | Optional, personal reflection on the interaction                                                   |
| takeaways        | text         | Optional, key learnings or insights                                                                |
| memorable_quote  | text         | Optional, notable quote from the interaction                                                       |
| fun_factor       | int          | Optional, 1–10 scale measuring enjoyment                                                           |
| novelty_flag     | boolean      | Optional, indicates novelty of the interaction                                                     |
| mystery_flag     | boolean      | Defaults to `false`                                                                                |
| reminder_at      | timestamp    | Optional, set reminder for follow-up                                                               |
| highlight        | string       | Optional, short note on what made it stand out                                                     |
| tags             | simple-array | Optional, categories: `work`, `personal`, `friendship`, `romance`, `networking`, `family`, `other` |
| attachments      | json         | Optional, array of attachment URLs or filenames                                                    |
| created_at       | timestamp    | Auto-generated on creation                                                                         |
| updated_at       | timestamp    | Auto-updated on modification                                                                       |

## Relationships

| Relation Type | Related Entity | Field / Notes                                          |
| ------------- | -------------- | ------------------------------------------------------ |
| Many-to-One   | User           | `user` — owner of the interaction, cascades on delete  |
| Many-to-One   | People         | `person` — optional related person, cascades on delete |

## Description

- Each `Interaction` is primarily linked to a user (`user_id`).
- Optionally linked to a `People` entity (`person_id`).
- Supports journaling and personal tracking with contextual, emotional, reflective, and engagement fields.
- Tags allow categorizing interactions for filtering or analysis.
- Attachments store additional files or references relevant to the interaction.
- Timestamps `created_at` and `updated_at` are automatically managed.

## Endpoints

| Method | Route               | Description                                                                              | Request Body / Query Params                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Response Type                   |
| ------ | ------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- | ---------------- |
| POST   | `/interactions`     | Create a new interaction                                                                 | **Payload (CreateInteractionDto):** <br>`json { "title": "Coffee Meetup", "date": "2025-09-12T10:00:00Z", "description": "Met to discuss project", "person_id": 1, "context": "Met at coffee shop", "medium": "in-person", "duration_minutes": 60, "location": "Cafe X", "mood": "happy", "energy_level": 8, "person_mood": "excited", "gratitude_level": 7, "reflection": "Good discussion", "takeaways": "Need to follow up", "memorable_quote": "Great ideas!", "fun_factor": 8, "novelty_flag": true, "mystery_flag": false, "reminder_at": "2025-09-15T09:00:00Z", "highlight": "Interesting conversation", "tags": ["work","networking"], "attachments": ["file1.pdf"] }` | `Interactions`                  |
| GET    | `/interactions`     | Retrieve all interactions for authenticated user with filtering, sorting, and pagination | **Query Parameters:** <br>`personName` (optional)<br>`tags` (optional, comma-separated)<br>`fromDate` (optional)<br>`toDate` (optional)<br>`sortByPersonName` (ASC                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | DESC)<br>`sortByUpdatedAt` (ASC | DESC)<br>`page` (default 1)<br>`limit` (default 20) | `Interactions[]` |
| GET    | `/interactions/:id` | Retrieve a single interaction by ID                                                      | `id` (path param, number)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `Interactions`                  |
| PATCH  | `/interactions/:id` | Update an existing interaction                                                           | **Payload (UpdateInteractionDto, partial fields allowed):** <br>`json { "title": "Updated title", "mood": "neutral" }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `Interactions`                  |
| DELETE | `/interactions/:id` | Delete an interaction by ID                                                              | `id` (path param, number)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `void`                          |

## Notes

- **Authentication**:
  - All endpoints are protected using `@UseGuards(AuthGuard('jwt'))`.
- **Filtering & Sorting**:
  - `tags` supports multiple values (comma-separated).
  - Sorting options include `sortByPersonName` and `sortByUpdatedAt`.
- **Pagination**:
  - Defaults: `page = 1`, `limit = 20`.
- **Validation**:
  - `@Param('id', ParseIntPipe)` ensures ID parameters are integers.
- **Optional Fields**:
  - Many fields in `CreateInteractionDto` and `UpdateInteractionDto` are optional to allow flexible journaling.
