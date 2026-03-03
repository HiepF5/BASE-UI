Rất tốt 🔥 giờ mình đi **thiết kế chuẩn production** cho

# 🎯 Filter + Query Builder UI (Level Admin Platform)

Mục tiêu:

* Dynamic theo metadata
* Support AND / OR / Nested group
* Filter theo relation (user.name, items.product.name)
* Convert sang Prisma / TypeORM / SQL
* Có thể mở rộng thành AI Query

---

# I. Kiến trúc tổng thể

```
UI (React)
   ↓
Filter AST (JSON)
   ↓
Query Engine (NestJS)
   ↓
ORM Adapter
   ↓
Database
```

---

# II. Thiết kế Filter AST chuẩn (quan trọng nhất)

Bạn nên chuẩn hóa format ngay từ đầu:

```ts
type FilterNode =
  | {
      type: "group"
      operator: "AND" | "OR"
      children: FilterNode[]
    }
  | {
      type: "condition"
      field: string
      operator: string
      value: any
    }
```

Ví dụ:

```json
{
  "type": "group",
  "operator": "AND",
  "children": [
    {
      "type": "condition",
      "field": "user.name",
      "operator": "contains",
      "value": "Hiệp"
    },
    {
      "type": "condition",
      "field": "total",
      "operator": "gt",
      "value": 1000
    }
  ]
}
```

Đây chính là AST.

---

# III. Frontend – Cấu trúc Component

```
QueryBuilder
 └── ConditionGroup
       ├── ConditionRow
       └── ConditionGroup (recursive)
```

---

## 1️⃣ QueryBuilder.tsx

```tsx
const QueryBuilder = ({ value, onChange }) => {
  return (
    <ConditionGroup
      node={value}
      onChange={onChange}
    />
  )
}
```

---

## 2️⃣ ConditionGroup (recursive)

```tsx
const ConditionGroup = ({ node, onChange }) => {
  const addCondition = () => {
    onChange({
      ...node,
      children: [
        ...node.children,
        {
          type: "condition",
          field: "",
          operator: "",
          value: ""
        }
      ]
    })
  }

  return (
    <div className="group">
      <select
        value={node.operator}
        onChange={(e) =>
          onChange({ ...node, operator: e.target.value })
        }
      >
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>

      {node.children.map((child, index) =>
        child.type === "group" ? (
          <ConditionGroup
            key={index}
            node={child}
            onChange={(newChild) => {
              const updated = [...node.children]
              updated[index] = newChild
              onChange({ ...node, children: updated })
            }}
          />
        ) : (
          <ConditionRow
            key={index}
            node={child}
          />
        )
      )}

      <button onClick={addCondition}>+ Condition</button>
    </div>
  )
}
```

---

# IV. Field Selector (Relation-aware)

Giả sử metadata trả về:

```ts
[
  { name: "id", type: "number" },
  { name: "total", type: "number" },
  { name: "user.name", type: "string" },
  { name: "user.email", type: "string" }
]
```

FieldSelect:

```tsx
const FieldSelect = ({ fields, value, onChange }) => {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {fields.map(f => (
        <option key={f.name} value={f.name}>
          {f.name}
        </option>
      ))}
    </select>
  )
}
```

---

# V. Operator Mapping theo Type

```ts
const operators = {
  string: [
    { label: "Equals", value: "equals" },
    { label: "Contains", value: "contains" },
    { label: "Starts with", value: "startsWith" }
  ],
  number: [
    { label: "=", value: "eq" },
    { label: ">", value: "gt" },
    { label: "<", value: "lt" }
  ],
  date: [
    { label: "Before", value: "before" },
    { label: "After", value: "after" }
  ]
}
```

Khi chọn field → load operator tương ứng.

---

# VI. Backend – Query Engine

Tạo thư mục:

```
/core/query-engine
   filter.parser.ts
   prisma.adapter.ts
   typeorm.adapter.ts
```

---

## filter.parser.ts

```ts
export function parseFilter(node: FilterNode): any {
  if (node.type === "group") {
    return {
      [node.operator]: node.children.map(parseFilter)
    }
  }

  if (node.type === "condition") {
    return {
      [node.field]: {
        [mapOperator(node.operator)]: node.value
      }
    }
  }
}
```

---

## mapOperator

```ts
function mapOperator(op: string) {
  const mapping = {
    eq: "equals",
    gt: "gt",
    lt: "lt",
    contains: "contains"
  }

  return mapping[op]
}
```

---

# VII. Relation Filter (Deep)

"user.name" cần convert thành:

### Prisma:

```ts
{
  user: {
    name: {
      contains: "Hiệp"
    }
  }
}
```

Bạn cần parse path:

```ts
function buildNested(field: string, operator: string, value: any) {
  const parts = field.split(".")
  return parts.reverse().reduce((acc, part) => ({
    [part]: acc
  }), { [operator]: value })
}
```

---

# VIII. Performance Strategy

⚠ Relation filter dễ gây join nặng.

Giải pháp:

* Limit depth relation (max 2)
* Add index DB
* Lazy join
* Materialized view nếu cần

---

# IX. Nâng cấp cao cấp

Sau khi có Query Builder cơ bản, bạn có thể thêm:

### 1️⃣ Quick Search

1 input search → auto OR across all string fields.

---

### 2️⃣ Saved Filter

Lưu JSON filter vào DB:

```ts
Filter {
  id
  name
  module
  filterJson
}
```

---

### 3️⃣ Export SQL Preview

Hiển thị SQL được generate.

---

# X. Kiến trúc chuẩn cho project của bạn

Frontend:

```
/core/query-builder
    QueryBuilder.tsx
    ConditionGroup.tsx
    ConditionRow.tsx
    operator.config.ts
```

Backend:

```
/core/query-engine
    filter.types.ts
    filter.parser.ts
    relation.parser.ts
    orm.adapter.ts
```

---

# XI. Khi nào bạn đã đạt level cao?

Khi bạn có:

* Dynamic metadata
* Relation-aware field selector
* Nested AND/OR
* Multi-DB adapter
* Transaction support
* Saved filter

→ Lúc này bạn đã có nền tảng giống:

* Retool
* Supabase
* Hasura

---

Nếu bạn muốn, tôi có thể:

1. Thiết kế full production-ready Query Engine cho NestJS
2. Viết cho bạn base React UI hoàn chỉnh
3. Hoặc nâng lên AI Filter (text → query JSON)

Bạn muốn đi sâu theo hướng nào? 🚀
