# Backend Architecture Rules

## 1. Tổng quan kiến trúc

```
server/
├── src/
│   ├── core/                     # Shared infrastructure
│   │   ├── database/             # Multi-DB adapter pattern
│   │   ├── guards/               # Auth & RBAC guards
│   │   ├── decorators/           # Custom decorators (@Roles, @CurrentUser, @Audit)
│   │   ├── filters/              # Exception filters
│   │   ├── interceptors/         # Logging, transform interceptors
│   │   ├── query-engine/         # Filter parser, relation resolver, ORM adapter
│   │   └── utils/                # SQL validator, string helpers
│   ├── modules/
│   │   ├── auth/                 # JWT authentication
│   │   ├── users/                # User management
│   │   ├── connections/          # DB connection management
│   │   ├── crud/                 # Generic CRUD engine
│   │   ├── schema/               # Schema introspection API
│   │   ├── audit/                # Audit logging
│   │   └── ai/                   # AI Builder module
│   ├── app.module.ts
│   └── main.ts
```

## 2. Nguyên tắc thiết kế

### 2.1 Clean Architecture

- `core/` KHÔNG import từ `modules/`
- Mỗi module PHẢI self-contained: `module.ts`, `controller.ts`, `service.ts`, DTOs
- Cross-module communication qua **DI** (inject service), KHÔNG import trực tiếp

### 2.2 Multi-DB Adapter Pattern

- Mọi database query đi qua `DatabaseAdapter` interface
- Adapter factory resolve adapter từ connection config
- KHÔNG viết raw SQL trực tiếp trong service — dùng adapter method
- Thêm DB mới = thêm 1 adapter class, register vào factory

### 2.3 Generic CRUD

- `CrudService` xử lý **mọi** entity/table qua metadata
- Nhận `tableName` từ URL param, KHÔNG tạo service riêng per entity
- Whitelist validation: chỉ cho phép table names có trong danh sách
- Pagination, filter, sort, search, include — tất cả pass-through qua `QueryOptions`

### 2.4 Guards & Middleware

- `JwtAuthGuard` → global guard (trừ public routes)
- `RolesGuard` + `@Roles()` → RBAC per endpoint
- `HttpExceptionFilter` → normalize error response format

### 2.5 AI Module

- **Skill pattern**: Mỗi skill implement `AiSkill` interface với `canHandle()` + `execute()`
- **Tool pattern**: Mỗi tool là injectable class, cung cấp file/git/exec/schema/test operations
- **Orchestrator**: Nhận prompt → chọn skill phù hợp qua `canHandle()` → delegate

## 3. Convention

### Naming

| Item       | Convention                      | Example                 |
| ---------- | ------------------------------- | ----------------------- |
| Module     | `PascalCase` + `.module.ts`     | `auth.module.ts`        |
| Controller | `PascalCase` + `.controller.ts` | `crud.controller.ts`    |
| Service    | `PascalCase` + `.service.ts`    | `crud.service.ts`       |
| Guard      | `PascalCase` + `.guard.ts`      | `jwt-auth.guard.ts`     |
| Decorator  | `camelCase` + `.decorator.ts`   | `roles.decorator.ts`    |
| DTO        | `PascalCase` + `.dto.ts`        | `create-user.dto.ts`    |
| Skill      | `kebab-case` + `.skill.ts`      | `nest-codegen.skill.ts` |
| Tool       | `kebab-case` + `.tool.ts`       | `file.tool.ts`          |

### File structure mỗi module

```
module-name/
├── module-name.module.ts       # NestJS module registration
├── module-name.controller.ts   # REST endpoints
├── module-name.service.ts      # Business logic
├── dto/                        # Data Transfer Objects
│   ├── create-xxx.dto.ts
│   └── update-xxx.dto.ts
└── interfaces/                 # TypeScript interfaces
```

### API Response format

```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 25
}
```

Error:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "name", "message": "required" }]
}
```

## 4. Quy trình thêm module mới

1. Tạo folder `src/modules/new-module/`
2. Tạo `new-module.module.ts` — register vào `AppModule`
3. Tạo controller → inject service
4. Tạo service → inject `DatabaseService` hoặc adapter
5. Tạo DTOs với `class-validator`
6. Viết unit tests
7. Update Swagger docs
