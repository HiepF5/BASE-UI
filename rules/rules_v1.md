## Rules v1 – Metadata-driven Admin Platform

Tài liệu này tổng hợp và hệ thống lại toàn bộ các rule từ:

- `Adapter Layer`
- `rules_database`
- `requiment`
- `base_ui`
- `Design System`
- `Filter + Query Builder UI`
- `Relation_nested CRUD`
- `State Management chuẩn production`

Mục tiêu: tạo một bức tranh thống nhất, dùng được như chuẩn thiết kế cho toàn bộ platform.

---

## 1. Tầm nhìn & mục tiêu hệ thống

- **Loại hệ thống**: Metadata-driven Admin / Low-code Data Platform.
- **Backend**: NestJS, kiến trúc sạch, multi-DB, có transaction, audit, security.
- **Frontend**: Vite + React, Dynamic CRUD, Query Builder, Relation + Nested CRUD.
- **Mục tiêu dài hạn**:
  - Thành internal platform trong công ty.
  - Có thể nâng cấp thành SaaS / low-code / AI builder.

### 1.1 Functional Requirements (từ `requiment.md`)

- **Core CRUD**:
  - Xem danh sách entity, schema, dữ liệu (pagination, sort, filter).
  - Tạo / cập nhật / xóa / bulk delete.
  - Export CSV.
- **Metadata-driven UI**:
  - UI render theo config / schema, không hard-code từng page.
- **Permission**:
  - Role-based access (RBAC).
  - Cấu hình quyền theo entity (create / update / delete / view).
- **Schema API**:
  - API trả về schema DB (columns, PK, FK, relations).
  - API validate entity.
- **Audit Log**:
  - Lưu lịch sử thay đổi dữ liệu (before / after / user / time).

### 1.2 Non-functional Requirements

- Response CRUD thường < 500ms cho trang danh sách.
- Security:
  - Block SQL nguy hiểm (DROP, TRUNCATE, DELETE không WHERE).
  - Parameterized query.
  - Mã hóa thông tin connection DB.
- Clean architecture / modular.
- Support multi-DB (Postgres, MySQL, Oracle; mở rộng thêm về sau).
- Transaction support cho Nested CRUD.

---

## 2. Kiến trúc tổng thể

### 2.1 Overall system view (từ `requiment` + `rules_database` + `Adapter Layer`)

```text
Frontend (React)
    ↓
API Layer (NestJS Controllers)
    ↓
Application Layer (Services: CRUD, Query Engine, Metadata, Relation)
    ↓
Database Abstraction Layer (DatabaseService + Adapters)
    ↓
Concrete Adapter (Postgres | MySQL | Oracle | ...)
    ↓
Database
```

- Controller **không** nói chuyện trực tiếp với Adapter.
- Mọi truy cập DB đi qua `CrudService` → `DatabaseService` → `DatabaseAdapter`.

### 2.2 Folder structure backend (chuẩn sản xuất, từ `requiment` + `rules_database` + `Adapter Layer`)

```text
src/
  main.ts
  app.module.ts

  core/
    database/
      database.module.ts
      database.service.ts
      adapters/
        base.adapter.ts
        postgres.adapter.ts
        mysql.adapter.ts
        oracle.adapter.ts
      factories/
        adapter.factory.ts
      types/
        db.types.ts
    guards/
    interceptors/
    filters/
    decorators/
    utils/

  modules/
    auth/
    users/
    schema/         # Đọc schema DB
    crud/           # Generic CRUD API
    audit/
    ai/             # (Optional)

  config/
    entities.config.ts

  shared/
```

### 2.3 Folder structure frontend (từ `base_ui` + `State Management` + `Design System`)

```text
src/
  main.tsx
  App.tsx

  core/
    api/
    query/        # React Query utilities
    store/        # Zustand stores (UI + global)
    form/         # React Hook Form helpers
    hooks/
    providers/    # QueryClientProvider, ThemeProvider...
    utils/

  layouts/
    BaseLayout.tsx

  components/
    base/
      BaseTable.tsx
      BaseForm.tsx
      BaseModal.tsx
      BaseFilterBar.tsx
      BaseButton.tsx

  modules/
    dynamic-crud/
      DynamicCrudPage.tsx
      hooks/
        useCrud.ts
      components/
        DynamicTable.tsx
        DynamicForm.tsx
        RelationTable.tsx
        QueryBuilder.tsx

  config/
    entities.config.ts
```

---

## 3. Database Abstraction & Adapter Layer

Hợp nhất nội dung từ `Adapter Layer.md` và `rules_database.md`.

### 3.1 Mục tiêu Adapter Layer

- Hỗ trợ nhiều DB: Postgres, MySQL, Oracle (mở rộng sau).
- Chuẩn hóa:
  - Schema representation (`ColumnSchema`).
  - Pagination trả về (`PaginationResult`).
  - Error (DatabaseError, type như `DUPLICATE_KEY`, `CONNECTION_ERROR`...).
  - Transaction (begin / commit / rollback).
- Không leak SQL / đặc thù DB ra ngoài Adapter.

### 3.2 Interface & common types (chuẩn hóa)

- `DBConfig`: type, host, port, username, password, database.
- `ColumnSchema`: name, type, nullable, primary, defaultValue.
- `QueryOptions`: page, limit, sort, filters, search.
- `PaginationResult<T>`: data, total, page, limit.
- `DatabaseAdapter` interface:
  - `connect`, `disconnect`
  - `getTables`, `getSchema`
  - `findAll`, `findById`, `insert`, `update`, `delete`
  - `executeRaw`
  - `beginTransaction`, `commit`, `rollback`

### 3.3 BaseAdapter & concrete adapters

- `BaseAdapter`:
  - Chứa logic transaction dùng `executeRaw`.
  - Các DB concrete extends và implement phần khác nhau (schema query, pagination…).
- Concrete adapters:
  - `PostgresAdapter`
  - `MysqlAdapter`
  - `OracleAdapter`

### 3.4 AdapterFactory & DatabaseService

- `AdapterFactory.create(config: DBConfig): DatabaseAdapter`:
  - Switch theo `config.type`, ném lỗi nếu không hỗ trợ.
- `DatabaseService`:
  - Quản lý `adapter` hiện tại / theo connection.
  - Các method high-level: `getTables`, `getSchema`, `findAll`, `executeRaw`, v.v.

### 3.5 Multi-connection / multi-tenant

- Bảng `db_connections`:
  - `id`, `name`, `type`, `host`, `port`, `username`, `password(encrypted)`, `database`.
- API:
  - Tạo connection, test connection, lưu connection.
  - Các route CRUD / schema nhận `connectionId`.

### 3.6 Security & pagination normalization

- Validate SQL trước khi `executeRaw`:
  - Chặn từ khóa nguy hiểm, `DELETE` không `WHERE`.
- Pagination:
  - Postgres/MySQL: `LIMIT/OFFSET`.
  - Oracle: `ROWNUM`/`FETCH NEXT`.
  - Tất cả normalize về `PaginationResult`.

---

## 4. Backend Modules: CRUD, Schema, Query Engine, Relation

### 4.1 CRUD module (từ `requiment`)

- Route chuẩn:
  - `GET    /api/:entity`
  - `POST   /api/:entity`
  - `PUT    /api/:entity/:id`
  - `DELETE /api/:entity/:id`
- Entity được validate:
  - Chỉ cho phép entity whitelisted trong `entities.config.ts`.
  - Quyền theo role / permission config.

### 4.2 Schema module

- `GET /schema/:entity` (hoặc `/schema/:connectionId/:table`):
  - Trả danh sách columns (từ Adapter) + relation metadata.
- Chuẩn hóa output để frontend dùng cho:
  - Dynamic form.
  - Relation-aware UI.
  - Query Builder field list.

### 4.3 Query Engine (từ `Filter + Query Builder UI`)

- Input: Filter AST JSON.
- Output: object query tương ứng ORM (Prisma/TypeORM) hoặc representation trung gian.
- Thành phần:
  - `filter.types.ts`: định nghĩa `FilterNode`.
  - `filter.parser.ts`: parse group/condition thành cấu trúc AND/OR.
  - `relation.parser.ts` + `buildNested()` cho path kiểu `user.name`.
  - `orm.adapter.ts`: map sang Prisma/TypeORM/SQL cụ thể.

### 4.4 Relation & Nested CRUD backend (từ `Relation_nested CRUD`)

- Metadata relation:
  - `type`: `OneToMany`, `ManyToOne`, `ManyToMany`, self relation.
  - `target`, `foreignKey`, `displayField`.
- Nested save strategies:
  - Save từng entity (đơn giản).
  - Save nested trong 1 transaction (khuyến nghị cho Order + OrderItem).
- Deep relation / self relation:
  - Dùng metadata + recursive load (có giới hạn depth).
- Vấn đề cần chú ý:
  - Circular relation.
  - Pagination cho nested table.
  - Lazy loading để tránh query nặng.

---

## 5. Base UI & Dynamic CRUD (Frontend)

Tổng hợp từ `base_ui`, `requiment`, `Relation_nested CRUD`, `Filter + Query Builder UI`.

### 5.1 Mục tiêu Base UI

- `DynamicCrudPage` là entry point:

```tsx
<DynamicCrudPage entity="users" />
```

- Từ `entity` (hoặc `EntityConfig`) tự render:
  - Table.
  - Form (create / edit).
  - Filter / Query Builder.
  - Relation nested table.
  - Pagination & actions.

### 5.2 Metadata cho Entity (frontend config)

- `EntityConfig`:
  - `name`, `label`, `primaryKey`.
  - `permissions`: `create`, `update`, `delete`.
  - `columns`: `ColumnConfig[]`.
  - Có thể mở rộng chứa `relations` để khớp backend metadata.
- `ColumnConfig`:
  - `key`, `label`, `type` (`text`, `number`, `date`, `select`, `boolean`, `relation`…).
  - `required`, `readonly`, `hiddenInTable`, `searchable`, `sortable`.
  - `options` cho `select`.

### 5.3 DynamicCrudPage container

- Kết hợp:
  - `useCrud(entity)` (hoặc hook dùng React Query).
  - `DynamicTable`.
  - `DynamicForm`.
  - Relation table / Query Builder tùy config.

### 5.4 Base components (không biết cụ thể entity)

- `BaseTable`:
  - Nhận `columns`, `data`, `loading`, các callback `onEdit`, `onDelete`.
  - Render cột dựa trên `ColumnConfig` (filter `hiddenInTable`).
- `BaseForm` / `DynamicForm`:
  - Render input bằng `renderInput(column, value, onChange)`.
  - Không hard-code field.
- `BaseModal`, `BaseFilterBar`, `BaseButton`:
  - Dùng chung cho mọi module.

### 5.5 Relation UI (từ `Relation_nested CRUD`)

- `ManyToOne`:
  - Dropdown với options fetch từ API (`user`, `product`...).
- `ManyToMany`:
  - Multi-select.
- `OneToMany`:
  - `RelationTable` inline ngay trong form cha:
    - Bảng con với các dòng thêm/sửa/xóa item.
    - Dùng `useFieldArray` (React Hook Form) hoặc state phù hợp.

### 5.6 Query Builder UI (từ `Filter + Query Builder UI`)

- Cấu trúc component:
  - `QueryBuilder` → `ConditionGroup` (recursive) → `ConditionRow`.
- Field select:
  - Dùng danh sách field từ metadata / schema API, bao gồm trường relation: `user.name`, `items.product.name`.
- Operator mapping:
  - Theo data type (`string`, `number`, `date`…).
- Output:
  - AST JSON gửi lên backend, backend convert thành query thực.

---

## 6. Design System & UI Library

Tổng hợp từ `Design System.md` + `base_ui`.

### 6.1 Monorepo & packages

- Cấu trúc gợi ý:

```text
apps/
  admin-web/

packages/
  ui/        # Design System
  tokens/    # Design tokens
  hooks/
```

- Dùng pnpm + Turborepo (hoặc tương đương).

### 6.2 Design tokens

- `colors`, `spacing`, `typography`, `radius`, `shadow`… được định nghĩa tập trung.
- Dùng CSS variables để hỗ trợ theme (light/dark).

### 6.3 Component layers

- `ui/components`:
  - Button, Input, Select, Table, Modal, Drawer, Form, Tabs, Breadcrumb…
- `ui/layout`:
  - Stack, Grid, Container.
- `ui/feedback`:
  - Toast, Alert, Skeleton, Spinner.

### 6.4 Variants & theming

- Sử dụng:
  - Tailwind + `class-variance-authority` (CVA) hoặc
  - CSS variables + utility classes.
- Button example:
  - `variant`: primary, secondary, ghost.
  - `size`: sm, md, lg.
  - `loading` state.

### 6.5 Accessibility & documentation

- A11y:
  - aria-label.
  - Keyboard navigation.
  - Focus ring, trap focus trong Modal.
- Storybook:
  - Document component.
  - Visual test.

---

## 7. State Management chuẩn production

Tổng hợp từ `State Management chuẩn production.md`.

### 7.1 Phân loại state

- **Server State**: data từ API → dùng React Query.
- **UI State**: modal open/close, sidebar, tab… → dùng Zustand.
- **Form State**: giá trị input, validation, nested array → dùng React Hook Form.
- **Global App State**: user, metadata, theme → dùng Zustand.

### 7.2 Stack đề xuất

- `@tanstack/react-query` cho server state.
- `zustand` cho global/UI store.
- `react-hook-form` (+ `useFieldArray`) cho dynamic/nested form.

### 7.3 Luồng chuẩn CRUD

```text
React Query → fetch data table
      ↓
Dynamic Form (React Hook Form) edit
      ↓
Mutation (React Query)
      ↓
invalidateQueries(tableKey)
      ↓
React Query refetch → UI cập nhật
```

### 7.4 Anti-pattern cần tránh

- Nhét toàn bộ vào Redux cho mọi thứ.
- Lưu server data vào Zustand thay vì React Query.
- Dùng Context cho state lớn & thay đổi nhiều.
- Dùng `useState` cho form phức tạp / nested.

---

## 8. Security, Permission & Audit

### 8.1 Security

- SQL protection:
  - Block `DROP`, `TRUNCATE`, `DELETE` không `WHERE`.
  - Chỉ cho phép subset câu lệnh được kiểm soát.
- Kết nối DB:
  - Mã hóa password trong DB.
  - Quản lý key trong env/secret manager.
  - Connection timeout / pool.

### 8.2 Permission

- RBAC ở backend:
  - Guard (`RoleGuard`) áp dụng cho module CRUD/schema.
  - Mapping role → quyền theo entity.
- UI:
  - Không render nút / action nếu không có quyền (`config.permissions`).

### 8.3 Audit log

- Bảng `audit_logs`:
  - `entity`, `action`, `before_data`, `after_data`, `user_id`, `created_at`.
- Hook vào service CRUD:
  - Sau mỗi create/update/delete ghi log.

---

## 9. Lộ trình phát triển & mức độ trưởng thành

### 9.1 Phase / roadmap (từ `requiment`, `Design System`, `Filter + Query Builder`, `Relation_nested`, `State Management`)

- **Phase 1 – MVP**:
  - CRUD đơn entity.
  - Schema API.
  - Pagination basic.
  - RBAC cơ bản.
- **Phase 2 – Advanced Data**:
  - Relation (FK dropdown, nested table).
  - Query Builder UI + Filter AST.
  - Saved Filter.
- **Phase 3 – Platform / AI**:
  - AI Query (text → filter JSON).
  - AI Validation / Suggestion.
  - Data insight.
- **Phase 4 – Enterprise**:
  - Multi-tenant.
  - Plugin system.
  - Full Design System + Storybook + versioning.

### 9.2 Mức độ trưởng thành Design System

- Level 1: Component tái sử dụng.
- Level 2: Theming + Design tokens.
- Level 3: Headless components.
- Level 4: Design System + CLI generator.
- Level 5: Internal Platform UI hoàn chỉnh.

---

## 10. Tóm tắt kiến trúc bạn đang xây dựng

- **Multi-Database Admin Platform**:
  - Adapter Layer + Database Abstraction.
  - Multi-connection, multi-DB.
- **Metadata-driven Admin Platform**:
  - Entity/Column/Relation metadata điều khiển UI & Query Engine.
- **Dynamic UI Engine**:
  - Dynamic CRUD, Relation + Nested CRUD, Query Builder.
- **Production-grade Frontend Architecture**:
  - React Query + Zustand + React Hook Form.
  - Design System riêng, có thể publish.

Tài liệu `rules_v1.md` này là bản tổng hợp v1. Các file rule chi tiết vẫn giữ vai trò “chuyên đề”. Khi cần, có thể tách tiếp thành các bản `v2` chuyên sâu cho từng mảng (DB, UI, Query Engine, Relation, State, Design System).

