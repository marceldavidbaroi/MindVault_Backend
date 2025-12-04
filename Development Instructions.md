Below is the compact, clean, standardized **README Module Development Guide** with the added
**✅ Auto-Documentation Template for Swagger**.

---

# 📘 Module Development Guide

**For AI Agents & Developers (NestJS + TypeORM + JWT Auth)**

This document defines the **official structure, patterns, and return types** required to build backend modules consistently.

---

# 📂 1. Module Folder Structure

Each module must follow this structure:

```
/src/<module-name>/
│── controller/
│     └── <module>.controller.ts
│── services/
│     ├── <module>.service.ts
│     └── other-feature.service.ts
│── entity/
│     └── <entity>.entity.ts
│── dto/
│     ├── create-*.dto.ts
│     ├── update-*.dto.ts
│     └── other.dto.ts
│── <module>.module.ts
```

---

# 🧱 2. Entity Requirements

### ✅ Naming rules

- Table names **must be snake_case**
- Entity class name is **PascalCase**
- Column names are automatically camelCase unless overridden

### Example:

```ts
@Entity("account_types") // snake_case table
export class AccountType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  name: string;
}
```

---

# 🛠 3. Service Structure (Mandatory Pattern)

All services must:

### ✔ Accept `User` from controller (auth context)

### ✔ Use dependency injection

### ✔ Handle access control inside service

### ✔ Throw NestJS exceptions (not manual messages)

### ❗ MUST return normalized ApiResponse format

---

# 🔄 4. **Return Type Rules (VERY IMPORTANT)**

### ✔ Controllers should NOT format responses

### ✔ Services MUST return this structure:

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

### Example inside service:

```ts
return {
  success: true,
  message: "Account updated",
  data: updatedAccount,
};
```

---

# 👤 5. Getting Current User

Use the decorator:

```ts
@GetUser() user: User
```

It injects the authenticated user's data from JWT.

---

# 🧩 6. Controller Structure

Controllers must:

- Use Swagger decorators
- Use `@UseGuards(AuthGuard('jwt'))`
- Use `GetUser()` to access authenticated user
- Return `ApiResponse<T>` exactly

### Example:

```ts
@Post()
async create(
  @GetUser() user: User,
  @Body() dto: CreateDto,
): Promise<ApiResponse<any>> {
  return this.service.create(user, dto);
}
```

**No formatting, no modifications.**

---

# 🧠 7. Service → Controller Data Flow

```
Controller → passes (user, dto, params)
Service → performs logic
Service → returns ApiResponse
Controller → returns ApiResponse AS-IS to client
```

---

# 🔐 8. Access Control Pattern

- **NEVER check permissions in controllers**
- Always check inside services

Example:

```ts
const userRole = await this.roleService.findOne(entityId, user.id);

if (!["owner", "admin"].includes(userRole.role.name)) {
  throw new ForbiddenException("Not allowed");
}
```

---

# 🏗 9. Standard CRUD Pattern (Template)

### Service

```ts
async create(user: User, dto: CreateDto): Promise<ApiResponse<Entity>> {
  const entity = this.repo.create(dto);
  const saved = await this.repo.save(entity);

  return {
    success: true,
    message: '<Entity> created',
    data: saved,
  };
}
```

### Controller

```ts
@Post()
async create(
  @GetUser() user: User,
  @Body() dto: CreateDto,
): Promise<ApiResponse<Entity>> {
  return this.service.create(user, dto);
}
```

---

# 📘 10. DTO Naming Standards

```
CreateXDto
UpdateXDto
AssignXDto
QueryXDto
```

All DTOs must use class-validator & class-transformer.

---

# 📌 11. Auto-Swagger Documentation Template (Copy/Paste)

### Add at top of controller:

```ts
@ApiTags('<Module Name>')
@UseGuards(AuthGuard('jwt'))
@Controller('<route-prefix>')
```

### For each endpoint:

```ts
@ApiOperation({ summary: '<Short description>' })
@ApiResponse({ status: 200, description: '<Success message>' })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not found' })
```

### Example template:

```ts
@Get(':id')
@ApiOperation({ summary: 'Get <Entity> by ID' })
@ApiResponse({ status: 200, description: '<Entity> fetched successfully.' })
@ApiResponse({ status: 404, description: '<Entity> not found.' })
async getOne(
  @Param('id', ParseIntPipe) id: number,
  @GetUser() user: User,
): Promise<ApiResponse<Entity>> {
  return this.service.getOne(id, user);
}
```

---

# 🤖 12. Rules for AI Agents (Module Generator)

When generating a new module:

### ✔ Must create:

- entity (snake_case table)
- dtos
- service
- controller
- module file

### ✔ Must use:

- `ApiResponse<T>` return format
- `@GetUser() user: User`
- Swagger decorators
- NestJS guards
- TypeORM repository injection

### ✔ Must avoid:

- Business logic inside controller
- Returning raw TypeORM entities directly
- Missing auth or role validation

---

# 🏁 Final Notes

Follow this document strictly.
All modules must remain **predictable**, **typed**, **authenticated**, and **fully Swagger-documented**.
