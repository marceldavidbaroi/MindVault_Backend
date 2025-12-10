# 📘 **MindVault — Module Development Guide**

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
│     └── <module>.data.ts      # default data for seeding
│── seeder/
│     └── <module>.seeder.ts    # seeder to populate default data
│── <module>.module.ts
```

---

# 🧱 **2. Entity Rules (Mandatory)**

- Table names must be **snake_case**
- Entity classes use **PascalCase**
- Use **numeric auto-increment PKs**
- Column names must be **snake_case**, entity fields **camelCase**
- Use `jsonb` for flexible metadata if needed

```ts
@PrimaryGeneratedColumn()
id: number;

@Column({ type: 'varchar', length: 150, name: 'display_name' })
displayName: string;
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

---

# 🌱 **15. Seeder & Data Folder Guidelines (Generic)**

- Each module that requires default data **must have a `data/` folder** in the module root.

  - This folder contains raw default data for seeding (TypeScript objects or JSON).

- The **seeder** is responsible for populating the database:

  - Imports data from `data/`
  - Calls repository methods to insert data
  - Can truncate or reset tables before seeding

- **Benefits:**

  - Keeps default data **centralized and reusable**
  - Clean separation of **data vs. logic**
  - Easy to update defaults without touching seeder logic

### Example Seeder (Generic)

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

2. **Dynamic relation loading**
   Fetch relations only when requested, using query flags:

   ```ts
   relations.forEach((r) => qb.leftJoinAndSelect(`tag.${r}`, r));
   ```

3. **Always load relations for single entities**

   ```ts
   await this.repo.findOne({ where: { id }, relations: ["group"] });
   ```

4. **Query DTO flags**
   Let the client control relations:

   ```ts
   @IsOptional() @IsBoolean() includeGroup?: boolean;
   ```

5. **Transformers for output**

   - Use IDs in lists
   - Include relational data in detailed responses

   ```ts
   groupId: tag.groupId,
   groupName: tag.group?.displayName
   ```

**✅ Principle:**

- Lists → IDs only (lightweight)
- Single entity → load full relation
- Keep control via query parameters

> ✅ **Key points:**
>
> - Data files are **pure data**, no logic
> - Seeders handle insertion, table cleanup, and logging
> - Modules can have multiple seeders if needed

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
