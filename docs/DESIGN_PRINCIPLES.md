# Design Principles

> Guiding rules for all code in the Base UI platform.

---

## 1. Metadata-Driven First

UI components **must** be renderable from metadata/config objects. No hard-coding entity-specific logic into reusable components.

```ts
// ✅ Good – driven by config
<DynamicForm columns={schema.columns} onSubmit={handleSubmit} />

// ❌ Bad – hard-coded fields
<form>
  <input name="username" />
  <input name="email" />
</form>
```

---

## 2. Composition Over Inheritance

Build small, focused components that compose together. Never create "god components" that handle everything.

```
BaseInput → FieldRenderer → DynamicForm → CrudPage
```

Each layer adds **one** concern:

- `BaseInput` – renders an input with styling
- `FieldRenderer` – picks the right component for a field type
- `DynamicForm` – orchestrates fields from metadata
- `CrudPage` – ties form + table + API together

---

## 3. Type Safety Everywhere

- All components have explicit TypeScript interfaces
- No `any` (use `unknown` + type guards)
- Generic hooks for reusability: `useCrud<T>`, `useSchema`
- Zod schemas for runtime validation

---

## 4. State Separation

| Kind         | Tool            | Example                     |
| ------------ | --------------- | --------------------------- |
| Server state | React Query     | API data, cache, pagination |
| Client state | Zustand         | UI toggles, theme, sidebar  |
| Form state   | React Hook Form | Field values, errors, dirty |
| URL state    | React Router    | Current page, entity param  |

**Never** store server data in Zustand. Never put ephemeral UI state in React Query.

---

## 5. Convention Over Configuration

- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utils/hooks
- One component per file (unless tightly coupled helpers)
- Barrel exports via `index.ts` per directory
- Consistent folder structure across packages

---

## 6. Escape Hatches

Every "magic" component must have an override mechanism:

```ts
// Override a specific field
<DynamicForm
  columns={schema.columns}
  overrides={{
    status: (field, control) => <CustomStatusField control={control} />
  }}
/>
```

---

## 7. Performance Budget

- Components use `React.memo` only when measurably beneficial
- Lists > 100 rows → virtual scrolling
- Lazy-load every route-level page
- React Query staleTime/gcTime tuned per resource

---

## 8. Accessible by Default

- All interactive elements are keyboard-navigable
- Labels on every form input
- ARIA attributes on dynamic content (modals, dropdowns)
- Color contrast meets WCAG AA

---

## 9. Package Independence

Packages (`@base-ui/*`) must **not** depend on `apps/admin-example`. The dependency arrow only goes one way:

```
admin-example → @base-ui/core-engine → @base-ui/ui → @base-ui/tokens
                                     → @base-ui/hooks
```

---

## 10. Documentation as Code

- Every exported function/component has JSDoc
- Every package has a README
- Rules & architecture decisions live in `/docs` and `/rules`
