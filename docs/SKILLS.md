## AI Builder Skill Catalog

### 1. Code Generation Skills

#### 1.1 `codegen.nest.crud` – NestJS CRUD Generator
- **Group**: `code-generation`
- **Mục tiêu**: Sinh module CRUD NestJS từ mô tả tự nhiên.
- **Input ví dụ**:  
  - "Tạo API quản lý Product gồm name, price, quantity"
- **Output**:
  - Thư mục `src/product/` (hoặc theo convention project):
    - `product.module.ts`
    - `product.controller.ts`
    - `product.service.ts`
    - `dto/`
    - `entity/`
- **Tool sử dụng**:
  - `FileTool` (tạo file, update file)
  - (Tương lai) `SchemaTool` nếu cần map DB

---

#### 1.2 `codegen.react.page` – React Page Generator
- **Group**: `code-generation`
- **Mục tiêu**: Sinh React page tương ứng với 1 module backend.
- **Input ví dụ**:
  - "Tạo trang Product list + create cho API /products"
- **Output**:
  - Page React (VD: `src/pages/ProductPage.tsx`) gồm:
    - Table list dữ liệu
    - Form tạo mới / edit
- **Tool sử dụng**:
  - `FileTool`

---

#### 1.3 `codegen.react.form` – React Form Generator
- **Group**: `code-generation`
- **Mục tiêu**: Sinh form + validation (Zod/Yup) từ schema/field.
- **Input ví dụ**:
  - "Form tạo user gồm name (required), email (email), age (number, optional)"
- **Output**:
  - Component form React + schema validate (Zod hoặc Yup)
- **Tool sử dụng**:
  - `FileTool`

---

### 2. Project Understanding Skills

#### 2.1 `project.analyzer` – Project Analyzer
- **Group**: `project-understanding`
- **Mục tiêu**: Đọc project hiện tại, hiểu structure + convention.
- **Nhiệm vụ**:
  - Quét thư mục (backend/frontend)
  - Nhận diện:
    - Framework (NestJS, Express, Next, React, ...)
    - Kiểu module (đặt tên, layout)
    - Coding convention cơ bản
  - Sinh `ProjectSummary` (techStack, conventions, modules)
- **Tool sử dụng**:
  - `FileTool` (list dir, read file)

---

### 3. File System / Apply Change Skills

#### 3.1 `fs.apply-change` – Apply File Changes
- **Group**: `filesystem`
- **Mục tiêu**: Nhận `FileChange[]` từ AI, apply thật lên project sau khi user confirm.
- **Nhiệm vụ**:
  - Create / update / delete file theo danh sách diff đã được approve.
- **Tool sử dụng**:
  - `FileTool`

---

### 4. AST Refactor Skills

#### 4.1 `refactor.ast` – AST Refactor Skill
- **Group**: `ast-refactor`
- **Mục tiêu**: Refactor TypeScript/JavaScript dựa trên AST, tránh replace text thô.
- **Nhiệm vụ**:
  - Thêm import đúng vị trí
  - Thêm method vào class
  - Sửa signature function
  - Không phá format / comment quan trọng
- **Công nghệ**:
  - `ts-morph` hoặc TypeScript Compiler API
- **Tool sử dụng**:
  - `FileTool`

---

### 5. Schema-Aware Skills

#### 5.1 `schema.ui-generator` – Schema Aware UI Generator
- **Group**: `schema-aware`
- **Mục tiêu**: Đọc DB schema → generate API + UI CRUD.
- **Nhiệm vụ**:
  - Đọc schema từ DB (Postgres, MySQL, …) hoặc Prisma/TypeORM schema.
  - Map table → entity + endpoint + React form + table.
- **Tool sử dụng**:
  - `SchemaTool`
  - `FileTool`

---

### 6. Planning / Agentic Skills

#### 6.1 `planning.generic` – Generic Planner
- **Group**: `planning`
- **Mục tiêu**: Biến yêu cầu lớn thành plan nhiều bước có thể thực thi.
- **Input ví dụ**:
  - "Tạo hệ thống auth JWT"
- **Output**:
  - Danh sách `PlanStep`:
    1. Cài package auth
    2. Tạo `AuthModule`
    3. Tạo `JwtStrategy`
    4. Update `AppModule`
    5. Tạo login endpoint
    6. Thêm guard/middleware
    7. Cập nhật frontend (form login, lưu token)
- **Tool sử dụng**:
  - Có thể không dùng tool, chỉ lập kế hoạch.
  - Kết hợp với Orchestrator để gọi các skill khác.

---

### 7. DevOps Skills

#### 7.1 `devops.generator` – DevOps Config Generator
- **Group**: `devops`
- **Mục tiêu**: Sinh file DevOps cơ bản.
- **Nhiệm vụ**:
  - Generate `Dockerfile` cho backend/frontend
  - Generate `docker-compose.yml`
  - Generate CI config (GitHub Actions / GitLab CI)
- **Tool sử dụng**:
  - `FileTool`

---

### 8. Debug Skills

#### 8.1 `debug.nest` – NestJS Debugger
- **Group**: `debug`
- **Mục tiêu**: Hỗ trợ debug lỗi NestJS từ log/error.
- **Input ví dụ**:
  - "Nest can't resolve dependencies of the XxxService"
- **Nhiệm vụ**:
  - Parse error
  - Dùng `FileTool` đọc module liên quan
  - Phát hiện thiếu `providers`, `imports`, `exports`
  - Gợi ý fix + optional `proposedChanges`
- **Tool sử dụng**:
  - `FileTool`

---

### 9. Core Services (không phải Skill nhưng liên quan)

#### 9.1 Planner / Orchestrator
- **Mục tiêu**: Chọn skill phù hợp, sắp xếp thứ tự thực thi.
- **Thành phần**:
  - `AiOrchestratorService`
  - `AiContextService` (giữ memory & project summary)

#### 9.2 Context / Memory
- **Mục tiêu**: Lưu:
  - Tech stack
  - Convention
  - Các module đã sinh
- **Dạng lưu**:
  - In-memory, file JSON, hoặc DB nhỏ.

