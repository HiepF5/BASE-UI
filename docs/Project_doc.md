> 🎯 Lập **Checklist + Phase + Timeline thực tế**
> Mục tiêu:
> **Build 1 BASE UI (Admin Core Platform)**
> Và tạo **Example project để user có thể config & extend**

---

# Yêu cầu

- Đọc và Làm theo doc
- Đọc làm theo rules
- Đọc và làm theo ai-builder.config

# 📦 SCOPE DỰ ÁN

Bạn đang build:

- 1 Base UI (component library + core engine)
- 1 Dynamic Admin Core
- 1 Example app để demo config
- Có thể scale thành internal platform

---

# 🗂 PHASE OVERVIEW

| Phase   | Nội dung                       | Dự kiến  |
| ------- | ------------------------------ | -------- |
| Phase 0 | Setup nền tảng                 | 3–5 ngày |
| Phase 1 | Design System + Base Component | 2–3 tuần |
| Phase 2 | Core Engine (Dynamic UI)       | 2–3 tuần |
| Phase 3 | Relation + Query Builder       | 2 tuần   |
| Phase 4 | Example Config App             | 1–2 tuần |
| Phase 5 | Hardening + Polish             | 1–2 tuần |

👉 Tổng: ~8–12 tuần (solo dev serious mode)

---

# 🟢 PHASE 0 – FOUNDATION SETUP (3–5 ngày)

## Checklist

### Repo setup

- [x] Setup monorepo (pnpm workspace)
- [x] apps/admin-example
- [x] packages/ui
- [x] packages/core-engine
- [x] packages/tokens

### Tooling

- [x] Vite + React + TS
- [x] ESLint + Prettier
- [x] Commitlint
- [x] Husky
- [x] Absolute import alias

### Architecture doc

- [x] Viết README vision
- [x] Define design principle
- [x] Define state strategy

---

# 🔵 PHASE 1 – DESIGN SYSTEM (2–3 tuần)

## 🎯 Goal:

Build BASE UI component library

---

## Week 1 – Tokens + Foundation

- [x] Color system

- [x] Spacing scale

- [x] Typography

- [x] Shadow scale

- [x] Border radius

- [x] Theme (light/dark)

- [x] CSS variables setup

- [x] Tailwind config override

---

## Week 2 – Core Components

### Form

- [x] Input
- [x] Select
- [x] MultiSelect
- [x] Checkbox
- [x] Radio
- [x] DatePicker
- [x] Switch

### Layout

- [x] Stack
- [x] Flex
- [x] Grid
- [x] Container

### Feedback

- [x] Button (variant system)
- [x] Spinner
- [x] Alert
- [x] Toast

---

## Week 3 – Data & Overlay

- [x] Table (headless)

- [x] Pagination

- [x] Modal

- [x] Drawer

- [x] Popover

- [x] Dropdown

- [x] Storybook setup

- [x] Component documentation

---

# 🟣 PHASE 2 – CORE ENGINE (Dynamic System) (2–3 tuần)

## 🎯 Goal:

Cho phép render UI từ metadata

---

## Week 4 – Metadata Engine

- [x] Define schema format

- [x] Field type mapping

- [x] Relation mapping

- [x] Validation config

- [x] FieldRenderer component

- [x] DynamicForm component

- [x] DynamicTable component

---

## Week 5 – CRUD Engine

- [x] Base API client
- [x] React Query integration
- [x] Dynamic list page
- [x] Dynamic create page
- [x] Dynamic edit page
- [x] Dynamic delete confirm

---

## Week 6 – State chuẩn production

- [ ] React Query setup
- [ ] Zustand store
- [ ] Global metadata store
- [ ] Form engine integration
- [ ] Optimistic update

---

# 🟠 PHASE 3 – ADVANCED FEATURE (2 tuần)

## 🎯 Goal:

Enterprise-level capability

---

## Relation + Nested CRUD

- [ ] ManyToOne dropdown
- [ ] OneToMany inline table
- [ ] ManyToMany multi-select
- [ ] Nested transaction support

---

## Query Builder

- [ ] AST format
- [ ] ConditionRow
- [ ] ConditionGroup
- [ ] Nested AND/OR
- [ ] Relation field support
- [ ] Backend parser adapter

---

# 🟡 PHASE 4 – EXAMPLE APP (1–2 tuần)

## 🎯 Goal:

User chỉ cần config JSON để có hệ thống

---

## Example modules

- [ ] User
- [ ] Order
- [ ] OrderItem
- [ ] Category (self relation)

---

## Config example

```ts
export const OrderModule = {
  name: 'Order',
  fields: [
    { name: 'total', type: 'number' },
    {
      name: 'user',
      type: 'relation',
      relation: {
        type: 'ManyToOne',
        target: 'User',
        displayField: 'name',
      },
    },
  ],
};
```

---

## Example features

- [ ] CRUD auto render
- [ ] Filter auto render
- [ ] Relation inline edit
- [ ] Saved filter
- [ ] Pagination

---

# 🔴 PHASE 5 – HARDENING (1–2 tuần)

## Performance

- [ ] Memo optimization
- [ ] Virtual table
- [ ] Code splitting

## DX (Developer Experience)

- [ ] CLI generator
- [ ] Template config
- [ ] Error boundary
- [ ] Logging strategy

## Quality

- [ ] Unit test core engine
- [ ] Integration test CRUD flow
- [ ] Lint strict mode

---

# 📁 FINAL STRUCTURE

```text
apps/
   admin-example/

packages/
   ui/
   core-engine/
   tokens/
   hooks/
```

---

# 🧠 Nếu làm Full-time (8h/day)

| Phase         | Thời gian |
| ------------- | --------- |
| Setup         | 1 tuần    |
| Design System | 3 tuần    |
| Core Engine   | 3 tuần    |
| Advanced      | 2 tuần    |
| Polish        | 1–2 tuần  |

→ 2–3 tháng để ra 1 BASE UI serious

---

# 🏁 Khi hoàn thành bạn sẽ có:

- 1 internal Admin Framework
- 1 Dynamic CRUD engine
- 1 Query Builder
- 1 Relation engine
- 1 Reusable UI library
- 1 Example project cho người dùng config

👉 Đây không còn là “web admin”, mà là mini-platform.
