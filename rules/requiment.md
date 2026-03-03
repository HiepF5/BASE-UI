Giờ mình sẽ thiết kế cho bạn **kiến trúc thư mục chuẩn production + yêu cầu hệ thống (System Requirements)** cho:

> 🧱 Web Quản Lý Table & Dữ Liệu
> 🧠 Metadata-driven
> ⚙ NestJS Backend
> 🎨 Vite + React Frontend
> 🚀 Có thể scale thành Low-code Platform

---

# 🎯 I. Yêu Cầu Hệ Thống (System Requirements)

## 1️⃣ Functional Requirements

### Core CRUD

* Xem danh sách entity (table)
* Xem schema (column, type, PK, FK)
* Xem dữ liệu (pagination, filter, sort)
* Create / Update / Delete
* Bulk delete
* Export CSV

### Metadata-driven UI

* UI render theo config
* Không hard-code từng page

### Permission

* Role-based access control (RBAC)
* Cấu hình quyền theo entity

### Schema API

* API trả về schema DB
* API validate entity

### Audit Log

* Lưu lịch sử thay đổi dữ liệu

---

## 2️⃣ Non-functional Requirements

* 🔐 Secure query (block DROP, unsafe DELETE)
* ⚡ Response < 500ms cho pagination
* 🧱 Modular architecture
* 🔄 Hỗ trợ multi-DB (optional)
* 🛡 Transaction support
* 📊 Logging

---

# 🏗 II. Kiến Trúc Tổng Thể

```text
Frontend (React)
    ↓
API Layer (NestJS)
    ↓
Application Layer
    ↓
Infrastructure Layer
    ↓
Database
```

Clean Architecture nhẹ.

---

# 🧠 III. Backend Folder Structure (NestJS)

```
src/
│
├── main.ts
├── app.module.ts
│
├── core/                  # Hạ tầng chung
│   ├── database/
│   │    ├── database.module.ts
│   │    ├── database.service.ts
│   │
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── decorators/
│   ├── utils/
│
├── modules/
│   ├── auth/
│   │    ├── auth.module.ts
│   │    ├── auth.controller.ts
│   │    ├── auth.service.ts
│   │
│   ├── users/
│   │
│   ├── schema/               # Đọc schema DB
│   │    ├── schema.module.ts
│   │    ├── schema.controller.ts
│   │    ├── schema.service.ts
│   │
│   ├── crud/                 # Generic CRUD
│   │    ├── crud.module.ts
│   │    ├── crud.controller.ts
│   │    ├── crud.service.ts
│   │
│   ├── audit/
│   │
│   ├── ai/                   # (Optional nâng cao)
│
├── config/
│   ├── entities.config.ts
│
└── shared/
```

---

# 🔥 Backend Logic Design

## CRUD Controller

```ts
GET    /api/:entity
POST   /api/:entity
PUT    /api/:entity/:id
DELETE /api/:entity/:id
```

Entity được validate theo whitelist.

---

## Schema Controller

```ts
GET /schema/:entity
```

Trả:

```json
{
  "columns": [
    { "name": "id", "type": "int", "nullable": false }
  ]
}
```

---

# 🎨 IV. Frontend Folder Structure (Vite + React)

```
src/
│
├── main.tsx
├── App.tsx
│
├── core/
│   ├── api/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│
├── layouts/
│   ├── BaseLayout.tsx
│
├── components/
│   ├── base/
│   │    ├── BaseTable.tsx
│   │    ├── BaseForm.tsx
│   │    ├── BaseModal.tsx
│   │    ├── BaseButton.tsx
│
├── modules/
│   ├── dynamic-crud/
│   │    ├── DynamicCrudPage.tsx
│   │    ├── DynamicTable.tsx
│   │    ├── DynamicForm.tsx
│
├── routes/
│
├── config/
│   ├── entity.config.ts
```

---

# 🧱 Frontend Architecture Pattern

## Core Layer

* API client
* Global error handler
* Auth logic

## Base Component Layer

* Table
* Form
* Modal
* Confirm dialog

## Module Layer

* Dynamic CRUD

---

# 🧠 V. Metadata Structure

```
config/entities.config.ts
```

```ts
export const entities = {
  users: {
    label: "User",
    permissions: {
      create: true,
      update: true,
      delete: false
    },
    columns: [
      { key: "id", type: "number", readonly: true },
      { key: "email", type: "email", required: true },
      { key: "role", type: "select", options: ["admin", "user"] }
    ]
  }
}
```

---

# 🛡 VI. Security Requirements

### SQL Protection

* Block:

  * DROP
  * TRUNCATE
  * DELETE không WHERE
* Escape input
* Use parameterized query

### Role Guard

```ts
@UseGuards(RoleGuard)
```

---

# 📊 VII. Database Tables cho hệ thống

## users

* id
* email
* password
* role

## audit_logs

* id
* entity
* action
* before_data
* after_data
* user_id
* created_at

---

# 🚀 VIII. Scale Roadmap

## Phase 1 (MVP)

* CRUD
* Schema API
* Pagination
* RBAC

## Phase 2

* Relation (FK select dropdown)
* Search advanced filter

## Phase 3

* AI Query
* AI Validation
* AI Data Insight

## Phase 4

* Multi-tenant
* Plugin system

---

# 🧠 Kiến trúc chuẩn bạn đang xây dựng là:

> Metadata-driven Admin Platform

Nếu làm tốt, bạn có thể:

* Biến nó thành template bán
* Biến nó thành low-code tool
* Biến nó thành SaaS

---

# 💬 Giờ mình hỏi bạn 1 câu quan trọng để tối ưu kiến trúc:

Database bạn muốn dùng:

1. PostgreSQL
2. MySQL
3. Oracle
4. Hỗ trợ nhiều loại DB

Chọn 1, mình sẽ tối ưu thiết kế DB layer và service layer cho đúng hướng production 🚀
