Below is the **complete, AI-optimized, production-ready Module Plan** for your **Tags Module** using your schema + your preferred MindVault architecture standard.

This includes:

✅ Folder structure
✅ What to create in each file
✅ Entities
✅ DTOs
✅ Validators
✅ Repository functions
✅ Service functions
✅ Controller endpoints
✅ Swagger summaries
✅ RBAC placement
✅ Soft-delete & recycle bin logic
✅ Filtering & searching

This is **100% aligned with your MindVault Module Development Guide**.

---

# 🏷 **Tags Module — Full Architecture Plan**

You have **two entities**:

- **Tag**
- **TagGroup**

We will build **one module** named `tags`, containing **two sub-features**:

- `tags` (individual tag management)
- `tag-groups` (groups/categories for tags)

---

# 📂 **1. Folder Structure**

```
/src/tags
│── controller/
│     ├── tags.controller.ts
│     └── tag-groups.controller.ts
│── services/
│     ├── tags.service.ts
│     └── tag-groups.service.ts
│── repository/
│     ├── tags.repository.ts
│     └── tag-groups.repository.ts
│── validators/
│     ├── tags.validator.ts
│     └── tag-groups.validator.ts
│── transformers/
│     ├── tags.transformer.ts
│     └── tag-groups.transformer.ts
│── entity/
│     ├── tag.entity.ts
│     └── tag-group.entity.ts
│── dto/
│     ├── create-tag.dto.ts
│     ├── update-tag.dto.ts
│     ├── query-tag.dto.ts
│     ├── create-tag-group.dto.ts
│     ├── update-tag-group.dto.ts
│     ├── query-tag-group.dto.ts
│     └── shared.dto.ts
│── tags.module.ts
```

---

# 🧱 **2. Entities (You already approved schema)**

### `tag.entity.ts`

- id
- name
- displayName
- description
- icon
- color
- isSystem
- userId
- groupId
- isDeleted
- deletedAt

### `tag-group.entity.ts`

Same idea but without `groupId`.

---

# 📦 **3. DTOs Required**

## Tags:

### `create-tag.dto.ts`

- name
- displayName
- description?
- icon?
- color?
- groupId?

### `update-tag.dto.ts`

- displayName?
- description?
- icon?
- color?
- groupId?

### `query-tag.dto.ts`

- q? (search by displayName, name)
- groupId?
- includeSystem?
- includeDeleted?
- limit?
- page?

---

## TagGroups:

### `create-tag-group.dto.ts`

- name
- displayName
- description?
- icon?

### `update-tag-group.dto.ts`

- displayName?
- description?
- icon?

### `query-tag-group.dto.ts`

- q?
- includeSystem?
- includeDeleted?
- limit?
- page?

---

# 🧪 **4. Validators**

## `tags.validator.ts`

- ensure tag name is unique (per user & system)
- ensure groupId exists
- ensure user cannot modify system tags unless role=admin

## `tag-groups.validator.ts`

- ensure group name unique
- ensure group cannot be deleted if system
- ensure normal user cannot modify system groups

---

# 🛢 **5. Repository Design**

## `tags.repository.ts`

### Required methods:

```ts
findAll(query: QueryTagDto, userId: string)
findOneById(id: string, userId: string)
createTag(payload)
updateTag(id, payload)
softDelete(id, userId)
restore(id, userId)
hardDelete(id, userId)
```

### Query behavior:

- search in `name`, `displayName`
- filter by `groupId`
- exclude system unless includeSystem=true
- soft-delete filter unless includeDeleted=true

---

## `tag-groups.repository.ts`

### Required methods:

```ts
findAll(query: QueryTagGroupDto, userId: string)
findOneById(id: string, userId: string)
createGroup(payload)
updateGroup(id, payload)
softDelete(id, userId)
restore(id, userId)
hardDelete(id, userId)
```

---

# 🎨 **6. Transformers**

## `tags.transformer.ts`

### Methods:

- `toResponse(tag: Tag)`
- `toListResponse(tags: Tag[])`

Transform:

- hide internal fields (userId, isDeleted)
- format deletedAt as ISO
- include group info (optional)
- map field names if needed

---

## `tag-groups.transformer.ts`

Same idea.

---

# 🛠 **7. Service Layer (Core Logic)**

## `tags.service.ts`

### Required functions:

```ts
create(user, dto)
update(id, user, dto)
getAll(user, query)
getOne(id, user)
delete(id, user)          -> soft delete
restore(id, user)
forceDelete(id, user)     -> hard delete
```

### Business logic:

- normal users can modify **only their own** or **system=false** tags
- admins can modify all
- cannot delete system tags unless admin
- validate uniqueness before creating
- validate group exists before linking

---

## `tag-groups.service.ts`

### Required functions:

```ts
createGroup(user, dto);
updateGroup(id, user, dto);
getAllGroups(user, query);
getOneGroup(id, user);
deleteGroup(id, user);
restoreGroup(id, user);
forceDeleteGroup(id, user);
```

### Business logic:

- prevent deletion of system groups unless admin
- cannot delete group that has tags (must reassign or cascade)
- name slug must be unique per user

---

# 🎮 **8. Controllers (Thin & Clean)**

All controllers follow:

```ts
@ApiTags('Tags')
@UseGuards(AuthGuard('jwt'))
@Controller('tags')
```

## `tags.controller.ts`

### Endpoints:

| Method | Route          | Description            |
| ------ | -------------- | ---------------------- |
| POST   | `/`            | Create tag             |
| GET    | `/`            | List tags (filterable) |
| GET    | `/:id`         | Fetch one tag          |
| PATCH  | `/:id`         | Update tag             |
| DELETE | `/:id`         | Soft delete tag        |
| PATCH  | `/:id/restore` | Restore tag            |
| DELETE | `/:id/force`   | Hard delete tag        |

All return:

```ts
Promise<ApiResponse<any>>;
```

---

## `tag-groups.controller.ts`

| Method | Route                 | Description  |
| ------ | --------------------- | ------------ |
| POST   | `/groups`             | Create group |
| GET    | `/groups`             | List groups  |
| GET    | `/groups/:id`         | Get group    |
| PATCH  | `/groups/:id`         | Update group |
| DELETE | `/groups/:id`         | Soft delete  |
| PATCH  | `/groups/:id/restore` | Restore      |
| DELETE | `/groups/:id/force`   | Hard delete  |

---

# 🔐 **9. RBAC Logic (Simplified)**

## Normal user:

- can create/update/delete **their own** tags & groups
- can only read system tags
- cannot modify system tags & groups

## Admin:

- full access
- can modify system tags & groups
- can delete system resources

Add this check in services:

```ts
if (tag.isSystem && user.role !== "admin") {
  throw new ForbiddenException("System tags cannot be modified.");
}
```

---

# 🗑 **10. Soft Delete / Restore / Force Delete Flow**

### soft delete:

```
isDeleted = true
deletedAt = new Date()
```

### restore:

```
isDeleted = false
deletedAt = null
```

### force delete:

Permanent remove.

**System items cannot be force deleted unless admin.**

---

# 🔍 **11. Filtering & Search Logic**

### Filter fields:

- q (search name/displayName)
- groupId
- includeDeleted
- includeSystem
- pagination: page, limit

### Query example in repo:

```ts
qb.where("(tag.displayName ILIKE :q OR tag.name ILIKE :q)", {
  q: `%${query.q}%`,
});
```

---

# 🎁 **12. Final Deliverables**

This plan tells you EXACTLY:

- what files to create
- where to put them
- what methods each file must contain
- how DTO → Validator → Service → Repo → Transformer work together
- what endpoints to expose
- what business rules to implement

---

# ✅ If you want, I can now generate:

### **A. All 20 files fully coded (entities, DTOs, services, controllers, repos, validators, transformers)**

OR

### **B. Generate a starter batch (e.g., only Entities + DTOs)**

OR

### **C. Full folder structure with placeholder empty classes**

Just tell me:
**“Generate full Tags Module”** or **“Generate entities only”** or whichever part you want.
