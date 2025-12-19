# 📘 **MindVault — Module Development Guide **

**For AI Agents & Developers (NestJS + TypeORM + RBAC + JWT)**

This guide defines the **standard architecture**, **patterns, and return rules** for building modules in MindVault.
It ensures every module is:

- Predictable
- Scalable
- Extensible
- AI-friendly
- Event-module compatible
- Swagger-documented

---

# 📂 **1. Module Folder Structure — Official Standard**

Each module **must** follow this expanded structure:

```

/src/<module-name>/
│── controller/
│     └── <module>.controller.ts
│── services/
│     ├── <module>.service.ts
│     └── <feature>.service.ts
│── repository/
│     └── <module>.repository.ts
│── transformers/
│     └── <module>.transformer.ts
│── validators/
│     └── <module>.validator.ts
│── entity/
│     └── <entity>.entity.ts
│── dto/
│     ├── create-*.dto.ts
│     ├── update-*.dto.ts
│     ├── query-*.dto.ts
│     └── shared.dto.ts
│── data/
│     └── <module>.data.ts
│── seeder/
│     └── <module>.seeder.ts
│── constants/
│     └── <module>.constants.ts   # Predefined constants, allowed relations, roles, etc.
│── <module>.module.ts
```

---

# 🧱 **2. Entity Rules (Mandatory)**

### ✔ Table names must be **snake_case**

### ✔ Entity classes use **PascalCase**

### ✔ Use **numeric auto-increment PKs**

```ts
@PrimaryGeneratedColumn()
id: number;
```

### ✔ Column names must be **snake_case**, entity fields **camelCase**

```ts
@Column({ type: 'varchar', length: 150, name: 'display_name' })
displayName: string;
```

### ✔ Use `jsonb` for flexible metadata if needed

---

### Example Entity Pattern

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "people" })
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, name: "first_name" })
  firstName: string;

  @Column({ type: "varchar", length: 100, name: "last_name" })
  lastName: string;

  @Column({ type: "varchar", length: 150, nullable: true, name: "email" })
  email?: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;
}
```

---

# 🛢 **3. Repository Layer (Data Access)**

Responsibilities:

- DB CRUD
- Query builder logic
- Filters & search
- Pagination
- Soft delete
- Relationship queries
- Performance optimizations

> Services **must not** contain SQL or QueryBuilder logic.

---

# 🧠 **4. Validator Layer (Input Validation + Business Rules)**

Validators handle:

- DTO-level validation (length, enums, dates, formats)
- Module-specific business validation (uniqueness, cross-field logic)

> ❗ Never put validation inside controllers or services.

---

# 🎨 **5. Transformer Layer (Output Formatting)**

Transformers convert **entities → API-friendly DTOs**:

- Format dates
- Hide internal fields
- Compute derived fields
- Rename fields
- Combine values
- Attach related entities

> Controllers must never format responses manually.

---

# 🛠 **6. Service Layer (Business Logic Only)**

Rules:

- Accept `user: User` from controller
- Perform permission checks
- Call repository methods
- Use validators
- Use transformers
- Return normalized `ApiResponse<T>`

> ❗ Never touch HTTP logic, format responses, access DB directly, or hard-code role checks.

---

# 🔄 **7. Return Type Rules (Standardized APIResponse)**

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

Controllers return **as-is**.

---

# 👤 **8. Getting the Current User**

```ts
@GetUser() user: User
```

---

# 🧩 **9. Controller Structure (Clean & Thin)**

Controllers:

- Use Swagger decorators
- Use JWT guard
- Delegate to services
- Return `ApiResponse<T>`

Example:

```ts
@Post()
async create(
  @GetUser() user: User,
  @Body() dto: CreateDto,
): Promise<ApiResponse<any>> {
  return this.service.create(user, dto);
}
```

---

# 📘 **10. DTO Standards**

Naming:

```
CreateXDto
UpdateXDto
QueryXDto
FilterXDto
```

- Use `class-validator`
- Use `class-transformer`

---

# 🎯 **11. Swagger Documentation Template (Auto-Docs)**

```ts
@ApiTags('<Module>')
@UseGuards(AuthGuard('jwt'))
@Controller('<route>')
```

Method example:

```ts
@Get(':id')
@ApiOperation({ summary: 'Get <Entity> by ID' })
@ApiResponse({ status: 200, description: '<Entity> fetched.' })
@ApiResponse({ status: 404, description: 'Not found.' })
async getOne(
  @Param('id') id: number,
  @GetUser() user: User,
): Promise<ApiResponse<Entity>> {
  return this.service.getOne(id, user);
}
```

---

# 🔐 **12. Access Control Pattern**

Permissions checked **inside services only**:

```ts
if (entity.userId !== user.id || entity.isSystem) {
  throw new ForbiddenException("Not allowed.");
}
```

> System-defined records can only be modified by developers.

---

# 🧩 **13. Event Module Compatibility**

Services may:

- Emit event creation requests
- Schedule reminders
- Send payloads
- Subscribe to centralized handlers

---

# 🤖 **14. AI Agent Rules**

Modules must generate:

- Entity
- DTOs
- Repository
- Validators
- Transformers
- Service
- Controller
- Module

Rules:

- Return `ApiResponse`
- Use Swagger
- Use `@GetUser()`
- Use guards
- Use repository for DB
- Use transformers for output
- Use validators for input

Avoid:

- Business logic in controllers
- DB logic in services
- Direct entity returns
- Modifying output shape in controller

```ts
import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { <ModuleName>Repository } from '../repository/<module-name>.repository';
import { defaultData } from '../data/<module-name>.data';

@Injectable()
export class <ModuleName>Seeder {
  constructor(private readonly repository: <ModuleName>Repository) {}

  @Command({ command: '<module-name>:seed', describe: 'Seed default data' })
  async seed() {
    await this.repository.truncate(); // optional
    await this.repository.saveMany(defaultData);
    console.log('✅ Default data seeded!');
  }
}
```

### Example Data File (Generic)

```ts
import { <EntityName> } from '../entity/<entity-name>.entity';

export const defaultData: Partial<<EntityName>>[] = [
  {
    name: 'example_1',
    displayName: 'Example 1',
    description: 'Description for example 1',
    isSystem: true,
  },
  {
    name: 'example_2',
    displayName: 'Example 2',
    description: 'Description for example 2',
    isSystem: true,
  },
];
```

# 🧱 **Entity Relations **

1. **Store IDs separately**
   Always keep the foreign key in a column, even with a relation:

   ```ts
   @ManyToOne(() => TagGroup)
   @JoinColumn({ name: 'group_id' })
   group?: TagGroup;

   @Column({ type: 'int', nullable: true, name: 'group_id' })
   groupId?: number;
   ```

   **Benefits:**

1. **Direct access without a join**
   You can read `entity.groupId` without fetching the full relation.

1. **Faster queries**
   Filtering by foreign key (`findBy({ groupId: 5 })`) does not require a JOIN.

1. **Cleaner, safer TypeScript code**
   Avoids unnecessary query builder complexity when only the ID is needed.

1. **Flexibility for other modules**
   Other modules can reference the FK directly without loading related entities.

1. **Consistency across entities**
   Ensures all relations follow the same pattern, making the codebase predictable and maintainable.

> ⚠️ **Rule:** Always declare both the FK column and the relation for any frequently queried or referenced relationship.

---

---

# **RelationValidator (Common Module)**

**Purpose:**
Validates that user-requested relations in a query are allowed for the module. Prevents invalid or unsafe joins in queries.

**Behavior:**

- Accepts a **comma-separated string** of relations from the request.
- Compares them against a **predefined list of allowed relations** (defined in the module’s constants).
- Throws a **BadRequestException** if any relation is invalid.
- Returns an **array of valid relations** for use in repository queries.

**Example:**

```ts
// constants/account.constants.ts
export const ACCOUNT_ALLOWED_RELATIONS = [
  "owner",
  "type",
  "currency",
  "transactions",
];

// service
import { RelationValidator } from "src/common/validators/relation.validator";
import { ACCOUNT_ALLOWED_RELATIONS } from "../constants/account.constants";

const relations = RelationValidator.validate(
  filter.relations,
  ACCOUNT_ALLOWED_RELATIONS
);
relations.forEach((rel) => qb.leftJoinAndSelect(`account.${rel}`, rel));
```

**Key Points:**

- Centralizes relation validation across modules.
- Avoids invalid joins that could break queries.
- Works with **any module** by passing the module-specific allowed relations.

---

Ensures modules are:

- Scalable
- Consistent
- Predictable
- Future-proof
- Event-ready
- Safe for AI agents
- Well-documented
- Maintainable

---

# 🏁 **Final Notes**

Ensures modules are:

- Scalable
- Consistent
- Predictable
- Future-proof
- Event-ready
- Safe for AI agents
- Well-documented
- Maintainable
