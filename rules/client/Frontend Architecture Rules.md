# Frontend Architecture Rules

## 1. Cấu trúc thư mục

```
frontend/src/
├── main.tsx                   # Entry point
├── App.tsx                    # Router + guard
├── index.css                  # Global styles + design tokens
├── vite-env.d.ts             # Vite types
├── core/                      # Shared infrastructure
│   ├── api/apiClient.ts       # Axios singleton
│   ├── providers/AppProviders.tsx  # React Query + Toast
│   └── utils/index.ts         # cn(), formatDate, debounce, buildQueryString
├── types/index.ts             # Shared TypeScript types
├── stores/                    # Zustand stores
│   ├── authStore.ts           # Auth state + actions
│   ├── uiStore.ts             # Sidebar, theme, AI panel
│   └── tableStore.ts          # Per-entity table state
├── hooks/                     # Custom hooks
│   ├── useCrud.ts             # Generic CRUD (React Query)
│   ├── useSchema.ts           # Schema fetching
│   └── useCommon.ts           # useDebounce, useLocalStorage, etc
├── components/
│   ├── base/                  # Design system atoms
│   │   ├── BaseButton.tsx     # CVA variants
│   │   ├── BaseTable.tsx      # Sortable, paginated
│   │   ├── BaseForm.tsx       # Metadata-driven (RHF + Zod)
│   │   ├── BaseModal.tsx      # Dialog
│   │   ├── BaseFilterBar.tsx  # Search + filter actions
│   │   └── BaseCommon.tsx     # Badge, Spinner, Card, Tabs, etc
│   └── query-builder/
│       └── QueryBuilder.tsx   # Nested AND/OR filter builder
├── layouts/
│   └── AdminLayout.tsx        # Sidebar + Header + Outlet
├── modules/                   # Feature pages
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── dynamic-crud/DynamicCrudPage.tsx
│   ├── connections/ConnectionsPage.tsx
│   ├── users/UsersPage.tsx
│   ├── audit/AuditPage.tsx
│   ├── settings/SettingsPage.tsx
│   └── ai-chat/AiChatPanel.tsx
└── config/
    └── entities.config.ts     # Hard-coded entity configurations
```

## 2. Nguyên tắc

### 2.1 Component Composition

- `components/base/` = **pure presentational** — nhận props, render UI, KHÔNG fetch data
- `modules/` = **smart pages** — fetch data, manage state, compose base components
- `layouts/` = **structural** — sidebar, header, outlet

### 2.2 State Management

- **Server state** → React Query (`useCrud`, `useSchema`)
- **Client state** → Zustand (`authStore`, `uiStore`, `tableStore`)
- **Form state** → React Hook Form
- KHÔNG dùng Redux, Context API cho global state

### 2.3 Metadata-driven UI

- `DynamicCrudPage` tự build table + form từ `ColumnConfig[]`
- `ColumnConfig[]` derive từ:
  1. Hard-coded `entities.config.ts` (nếu registered)
  2. Auto-generated từ DB schema (via `useSchema`)
- Mọi table/form/filter ĐỀU driven by metadata

### 2.4 Styling

- **Tailwind CSS** + **CVA** (class-variance-authority) cho component variants
- **`cn()`** utility = `clsx` + `tailwind-merge`
- Design tokens qua CSS custom properties (`:root {}`)
- KHÔNG dùng CSS modules, styled-components, hoặc inline styles

### 2.5 Routing

- React Router v6 với lazy loading (`React.lazy`)
- `PrivateRoute` guard check `isAuthenticated`
- `AdminLayout` wraps tất cả protected routes via `<Outlet />`

## 3. Naming Conventions

| Item          | Convention                       | Example                        |
| ------------- | -------------------------------- | ------------------------------ |
| Component     | `PascalCase.tsx`                 | `BaseButton.tsx`               |
| Hook          | `camelCase.ts`                   | `useCrud.ts`                   |
| Store         | `camelCase.ts`                   | `authStore.ts`                 |
| Utility       | `camelCase.ts`                   | `utils/index.ts`               |
| Type          | `PascalCase` in `types/index.ts` | `EntityConfig`                 |
| CSS class     | Tailwind classes                 | `bg-primary-500 text-white`    |
| Event handler | `handle{Action}`                 | `handleSubmit`, `handleDelete` |

## 4. Performance Rules

- Lazy load page components (`React.lazy`)
- `useMemo` cho computed data (column configs)
- `useCallback` cho event handlers passed to child components
- React Query `staleTime: 30s` — avoid unnecessary refetch
- Table pagination: server-side (KHÔNG load toàn bộ data)
- QueryBuilder: keep filter state local until "Apply"

## 5. Thêm Page mới

1. Tạo `modules/new-page/NewPage.tsx`
2. Export default (cho lazy import)
3. Thêm route trong `App.tsx`:
   ```tsx
   const NewPage = lazy(() => import('@/modules/new-page/NewPage'));
   // trong Routes:
   <Route path="new-page" element={<NewPage />} />;
   ```
4. Thêm nav item trong `AdminLayout.tsx`
5. (Optional) Thêm entity config trong `entities.config.ts`
