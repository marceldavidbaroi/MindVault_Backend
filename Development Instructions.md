Great — I’ll update and enhance this **Module Development Guide** to match your expanded architecture:

- Repository Layer
- Validators Layer
- Transformers Layer
- (Optional) Event Hooks
- AI-friendly patterns
- Contact/Finance module scalability
- Full modernization + clarity

Here is the **updated, polished, extended version**:

---

# 📘 **MindVault — Module Development Guide (Updated & AI-Optimized)**

**For AI Agents & Developers (NestJS + TypeORM + RBAC + JWT)**

This guide defines the **standard architecture**, **patterns**, and **return rules** for building modules in MindVault.
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
│── <module>.module.ts
```

### **Why this structure?**

- Clean separation of **Data → Logic → Validation → Output**
- Perfect for AI agents to modify safely
- Supports future Event Module hooks
- Reduces code duplication
- Improves readability & testability

---

# 🧱 **2. Entity Rules (Mandatory)**

### ✔ Table names must be **snake_case**

### ✔ Entity classes use **PascalCase**

### ✔ Use `uuid` for primary keys

### ✔ Use TypeORM decorators consistently

### ✔ Use `jsonb` for flexible metadata

### Example:

```ts
@Entity("people")
export class Person {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;
}
```

---

# 🛢 **3. Repository Layer (Data Access)**

Every module must use a **custom repository**.

### **Responsibilities**

- DB CRUD
- Query builder logic
- Filters & search
- Pagination
- Soft delete
- Relationship queries
- Performance optimizations

### **Service should NOT contain SQL or QueryBuilder logic.**

---

# 🧠 **4. Validator Layer (Input Validation + Business Rules)**

Validators handle:

### DTO-level validation

- email format
- phone format
- string length
- enums
- date validation

### Module-specific business validation

- uniqueness checks
- future/past date rules
- cross-field validation
- logical constraints
- metadata schema rules

### ❗ NEVER put validation inside controller or service.

---

# 🎨 **5. Transformer Layer (Output Formatting)**

Transformers convert **entities → API-friendly DTO responses**.

### Responsibilities:

- Format dates
- Hide internal fields
- Compute derived fields
- Rename fields
- Combine values (e.g., fullName)
- Attach related entities
- Prepare consistent output structure

### Controllers must NEVER manually format responses.

---

# 🛠 **6. Service Layer (Business Logic Only)**

### Service rules:

- Always accept `user: User` from controller
- Perform permission checks
- Call repository methods
- Use validators if needed
- Use transformers for output
- Return normalized ApiResponse

### ❗ Never:

- Touch HTTP logic
- Format responses
- Access database directly
- Hard-code role checks

---

# 🔄 **7. Return Type Rules (Standardized APIResponse)**

Every service returns:

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

### Controller returns the service result **AS-IS**.

---

# 👤 **8. Getting the Current User**

Always use:

```ts
@GetUser() user: User
```

---

# 🧩 **9. Controller Structure (Clean & Thin)**

Controllers:

- MUST use Swagger decorators
- MUST use JWT guard
- MUST delegate everything to services
- MUST return `ApiResponse<T>` as received

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

All DTOs must use:

- class-validator
- class-transformer

---

# 🎯 **11. Swagger Documentation Template (Auto-Docs)**

At the top:

```ts
@ApiTags('<Module>')
@UseGuards(AuthGuard('jwt'))
@Controller('<route>')
```

Each method:

```ts
@ApiOperation({ summary: '<Short description>' })
@ApiResponse({ status: 200, description: '<Success message>' })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not found' })
```

Full example:

```ts
@Get(':id')
@ApiOperation({ summary: 'Get <Entity> by ID' })
@ApiResponse({ status: 200, description: '<Entity> fetched.' })
@ApiResponse({ status: 404, description: 'Not found.' })
async getOne(
  @Param('id') id: string,
  @GetUser() user: User,
): Promise<ApiResponse<Entity>> {
  return this.service.getOne(id, user);
}
```

---

# 🔐 **12. Access Control Pattern (Mandatory)**

**Permissions must ONLY be checked inside services**.

Example:

```ts
const role = await this.roleService.findUserRole(entityId, user.id);

if (!["owner", "admin"].includes(role.name)) {
  throw new ForbiddenException("Not allowed");
}
```

---

# 🧩 **13. Event Module Compatibility (Future-Proofing)**

All modules should be prepared to interact with the Event Module.

### Services may:

- emit event creation requests
- schedule reminders
- send event payloads
- subscribe to centralized handlers

This improves maintainability and automation.

---

# 🤖 **14. AI Agent Rules (Autonomous Generation)**

When an AI agent generates a module, it MUST:

### Create:

✔ entity
✔ DTOs
✔ repository
✔ validators
✔ transformers
✔ service
✔ controller
✔ module

### Follow:

✔ Return ApiResponse
✔ Use Swagger
✔ Use `@GetUser()`
✔ Use guards
✔ Use repository for DB
✔ Use transformers for output
✔ Use validators for input

### Avoid:

❌ business logic in controllers
❌ db logic in services
❌ direct entity returns
❌ modifying output shape in controller

---

# 🏁 Final Notes

This guide ensures that every module is:

- scalable
- consistent
- predictable
- future-proof
- event-ready
- safe for AI agents
- well-documented
- maintainable long term

---
