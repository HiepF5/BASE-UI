# State Management Strategy

> How state is organized across the Base UI platform.

---

## Overview

We use a **multi-layer strategy** — each kind of state has a dedicated tool optimized for it.

```
┌──────────────────────────────────────────────┐
│              Application State               │
├───────────────┬──────────────────────────────┤
│  Server State │  TanStack React Query v5     │
│  (API data)   │  - Auto-cache, refetch       │
│               │  - Optimistic updates        │
│               │  - staleTime: 30s            │
│               │  - gcTime: 5min              │
├───────────────┼──────────────────────────────┤
│  Client State │  Zustand                     │
│  (UI state)   │  - Sidebar, theme, modals    │
│               │  - Auth tokens               │
│               │  - Per-entity table state     │
│               │  - Persist (localStorage)    │
├───────────────┼──────────────────────────────┤
│  Form State   │  React Hook Form + Zod       │
│               │  - Field values & errors     │
│               │  - Validation                │
│               │  - Dirty/touched tracking    │
├───────────────┼──────────────────────────────┤
│  URL State    │  React Router v6             │
│               │  - Current route & params    │
│               │  - Entity name from URL      │
│               │  - Tab / view selection       │
└───────────────┴──────────────────────────────┘
```

---

## Server State (React Query)

### Configuration

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60_000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Key Convention

```ts
// List
['entity', entityName, 'list', queryOptions][
  // Single item
  ('entity', entityName, 'detail', id)
][
  // Schema
  ('schema', tableName)
][
  // Table list
  ('schema', 'tables')
];
```

### Mutation Pattern

All mutations use the `useCrud<T>(entityName)` hook which provides:

- `createMutation` — POST + invalidate list
- `updateMutation` — PUT + invalidate list + detail
- `deleteMutation` — DELETE + invalidate list
- `bulkDeleteMutation` — DELETE batch + invalidate list

---

## Client State (Zustand)

### Store Architecture

```
stores/
├── authStore.ts      # Auth tokens, user profile, login/logout
├── uiStore.ts        # Sidebar, AI panel, theme, loading
├── tableStore.ts     # Per-entity table state (page, sort, filter, search)
└── index.ts          # Barrel export
```

### Rules

1. **No server data in Zustand** — use React Query instead
2. **Persist only what makes sense** — auth tokens yes, table filters no
3. **Per-entity slices** in tableStore using a `Map<string, TableState>` pattern
4. **Immer middleware** for clean nested state updates

### Auth Store

```ts
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (tokens: AuthTokens) => void;
  fetchProfile: () => Promise<void>;
}
```

### Table Store (per-entity)

```ts
interface EntityTableState {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search: string;
  filter: FilterGroup | null;
  selectedIds: string[];
}
```

---

## Form State (React Hook Form + Zod)

### Auto-Generated Schemas

The `DynamicForm` component auto-generates Zod schemas from `ColumnConfig[]`:

```ts
function buildZodSchema(columns: ColumnConfig[]) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const col of columns) {
    if (col.name === 'id') continue;
    let field = z.string(); // default
    // Map column type → Zod type
    if (col.type === 'number') field = z.coerce.number();
    if (col.type === 'boolean') field = z.boolean();
    if (col.required) shape[col.name] = field;
    else shape[col.name] = field.optional();
  }
  return z.object(shape);
}
```

### Rules

1. Form state **never** leaves the form component
2. Use `defaultValues` from API data (for edit mode)
3. Validate on blur for fields, on submit for the form
4. Show inline errors per field

---

## URL State (React Router)

### Route Structure

```
/login                      → LoginPage
/                           → DashboardPage
/entity/:entityName         → DynamicCrudPage
/connections                → ConnectionsPage
/users                      → UsersPage
/audit                      → AuditPage
/settings                   → SettingsPage
```

### URL as Source of Truth

The entity name comes from the URL param `:entityName`. This drives:

- Which schema to fetch
- Which table state to use
- Which API endpoints to call
- Which columns to render

---

## Data Flow Summary

```
User Action
    │
    ▼
React Router (URL state)
    │
    ▼
Zustand (client state: which entity, filters, sort)
    │
    ▼
React Query (server state: fetch with params)
    │
    ▼
Component (renders data)
    │
    ▼
React Hook Form (user edits → validate → submit)
    │
    ▼
React Query Mutation (save to server → invalidate cache)
```
