# 🎯 MỤC TIÊU BASE UI

Bạn sẽ có:

```tsx
<DynamicCrudPage entity="users" />
```

Và toàn bộ:

- Table
- Form
- Filter
- Modal
- Permission
- Pagination

→ tự render.

---

# 🏗 1️⃣ Kiến trúc Frontend Chuẩn

```
src/
│
├── core/
│   ├── api/
│   ├── hooks/
│   ├── store/
│   ├── providers/
│
├── layouts/
│   ├── BaseLayout.tsx
│
├── components/
│   ├── base/
│   │    ├── BaseTable.tsx
│   │    ├── BaseForm.tsx
│   │    ├── BaseModal.tsx
│   │    ├── BaseFilterBar.tsx
│   │    ├── BaseButton.tsx
│
├── modules/
│   ├── dynamic-crud/
│   │    ├── DynamicCrudPage.tsx
│   │    ├── hooks/
│   │    │    ├── useCrud.ts
│   │    ├── components/
│   │    │    ├── DynamicTable.tsx
│   │    │    ├── DynamicForm.tsx
│
├── config/
│   ├── entities.config.ts
```

---

# 🧠 2️⃣ Metadata Design (Trái tim hệ thống)

📁 `entities.config.ts`

```ts
export interface EntityConfig {
  name: string;
  label: string;
  primaryKey: string;
  permissions: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  columns: ColumnConfig[];
}

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required?: boolean;
  readonly?: boolean;
  hiddenInTable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  options?: { label: string; value: any }[];
}
```

Ví dụ:

```ts
export const userConfig: EntityConfig = {
  name: 'users',
  label: 'Users',
  primaryKey: 'id',
  permissions: {
    create: true,
    update: true,
    delete: false,
  },
  columns: [
    { key: 'id', label: 'ID', type: 'number', readonly: true },
    { key: 'email', label: 'Email', type: 'text', required: true, searchable: true },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
};
```

---

# 🧱 3️⃣ DynamicCrudPage (Container)

```tsx
function DynamicCrudPage({ config }: { config: EntityConfig }) {
  const { data, loading, create, update, remove } = useCrud(config.name);

  return (
    <>
      <DynamicTable
        config={config}
        data={data}
        loading={loading}
        onEdit={update}
        onDelete={remove}
      />

      {config.permissions.create && <DynamicForm config={config} onSubmit={create} />}
    </>
  );
}
```

---

# 📊 4️⃣ BaseTable (Generic)

BaseTable không biết entity gì.

```tsx
interface BaseTableProps {
  columns: ColumnConfig[];
  data: any[];
  loading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}
```

Dynamic render:

```tsx
{
  columns.filter((col) => !col.hiddenInTable).map((col) => <td>{row[col.key]}</td>);
}
```

---

# 🧩 5️⃣ DynamicForm Engine

```tsx
function renderInput(column: ColumnConfig, value, onChange) {
  switch (column.type) {
    case 'text':
      return <input value={value} onChange={onChange} />;

    case 'number':
      return <input type="number" value={value} onChange={onChange} />;

    case 'select':
      return (
        <select value={value} onChange={onChange}>
          {column.options?.map((opt) => (
            <option value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'boolean':
      return <input type="checkbox" checked={value} onChange={onChange} />;
  }
}
```

👉 Không bao giờ hard-code field.

---

# 🧠 6️⃣ useCrud Hook (Logic Layer)

```ts
export function useCrud(entity: string) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const res = await api.get(`/crud/default/${entity}`);
    setData(res.data);
    setLoading(false);
  }

  async function create(payload) {
    await api.post(`/crud/default/${entity}`, payload);
    fetchData();
  }

  return { data, loading, create, fetchData };
}
```

---

# 🧱 7️⃣ BaseModal

Modal dùng chung:

```tsx
<BaseModal open={isOpen} title="Edit User" onClose={() => setOpen(false)}>
  <DynamicForm />
</BaseModal>
```

---

# 🎯 8️⃣ Pagination Strategy

Table nhận:

```ts
{
  (page, limit, total);
}
```

BaseTable render pagination chung.

---

# 🧠 9️⃣ Permission Handling UI

Không render button nếu:

```ts
!config.permissions.delete;
```

---

# 🔥 10️⃣ Enterprise-Level Enhancement

## 1️⃣ Relation Support (FK)

Column type:

```ts
{
  key: "user_id",
  type: "relation",
  relation: {
    entity: "users",
    labelField: "email",
    valueField: "id"
  }
}
```

DynamicForm sẽ fetch options từ API.

---

## 2️⃣ Filter Builder

Tạo component:

```
<BaseFilterBar />
```

Dựa vào:

```ts
searchable: true;
```

---

# 🚀 Level Advanced: UI Engine Diagram

```text
EntityConfig
    ↓
DynamicCrudPage
    ↓
BaseTable + BaseForm
    ↓
BaseInputFactory
```
