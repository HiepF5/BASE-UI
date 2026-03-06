## Quy tắc tạo **Module React** (ngắn – dễ áp dụng)

### 1️⃣ Nguyên tắc

- **1 module = 1 domain feature**
- Module **tự chứa (self-contained)**
- **Không import module khác**
- Chỉ dùng **core / shared**
- Page nằm trong module

Ví dụ module:

```
auth
dashboard
user
dynamic-crud
report
```

---

# Cấu trúc module chuẩn

```
modules/
  user/
    api/
      user.api.ts
    components/
      UserForm.tsx
      UserTable.tsx
    hooks/
      useUsers.ts
    pages/
      UserListPage.tsx
      UserDetailPage.tsx
    services/
      user.service.ts
    store/
      user.store.ts
    types/
      user.types.ts
    utils/
      user.helper.ts
    index.ts
```

---

# Ý nghĩa nhanh

| Folder     | Chức năng       |
| ---------- | --------------- |
| api        | gọi backend     |
| components | UI riêng module |
| hooks      | logic           |
| pages      | route page      |
| services   | business logic  |
| store      | state           |
| types      | type            |
| utils      | helper          |

---

# Naming rule

```
Component: UserTable.tsx
Hook: useUsers.ts
Service: user.service.ts
Store: user.store.ts
Types: user.types.ts
```

---

# Import rule

❌ Sai

```
modules/auth -> import modules/user
```

✅ Đúng

```
modules/auth -> core
modules/auth -> shared components
```

---

# Export module

`modules/user/index.ts`

```
export * from "./pages/UserListPage";
export * from "./hooks/useUsers";
```

---

# Rule nhớ nhanh

```
core = platform engine
components = shared UI
modules = business feature
```
