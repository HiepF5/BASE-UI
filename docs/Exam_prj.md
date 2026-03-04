> 🎯 **Danh sách MÀN HÌNH MẪU (Screen Blueprint) cho Base UI**
> để:
>
> - Thể hiện đầy đủ capability engine
> - Demo config-based rendering
> - Phù hợp enterprise scale

---

# 🧱 0️⃣ GLOBAL LAYOUT (Base Shell)

![Image](https://forum.bootstrapstudio.io/uploads/default/original/2X/7/768b9bb81b2c87ee0913c56ad9cc0dcb9860109e.jpeg)

![Image](https://camo.githubusercontent.com/d72b576a67197082cf9f0ba074086088d50edc2aa8e46cf150af7e08d856550c/68747470733a2f2f6173736574732e636f726575692e696f2f70726f64756374732f636f726575692d667265652d626f6f7473747261702d61646d696e2d74656d706c6174652d6c696768742d6461726b2e77656270)

![Image](https://coreui.io/images/templates/coreui_free_light_dark_hu_d65b24ef959f0d81.webp)

![Image](https://s3.amazonaws.com/creativetim_bucket/products/138/original/opt_bdp_thumbnail.jpg?1547454513=)

## 🎯 Mục đích

Làm nền cho toàn bộ platform.

## Thành phần

- Sidebar (module-based dynamic menu)
- Topbar
  - Global search
  - Theme switch
  - User menu

- Breadcrumb
- Tab view (optional enterprise mode)
- Notification center
- Global Command Palette (⌘K)

## Checklist

- [ ] Layout config driven
- [ ] Menu render từ metadata
- [ ] Permission-aware menu
- [ ] Dark/Light mode

---

# 📊 1️⃣ DASHBOARD (Dynamic Analytics Screen)

![Image](https://cdn.dribbble.com/userupload/32090023/file/original-61994ca2bd26859e5405208d03f44417.png?resize=400x0)

![Image](https://cdn.vectorstock.com/i/500p/18/90/business-analytics-dashboard-charts-widgets-vector-59781890.jpg)

![Image](https://adminkit.io/static/91ffbe0f58e35a5fc15edb464129ee3f/3a874/bootstrap-analytics-dashboard.png)

![Image](https://cdn.sanity.io/images/hkc8ojqt/production/9acbde48b49cdec2c85ad41567a673ee70f25aa6-1920x1008.jpg)

## 🎯 Goal

Demo khả năng:

- [x] Widget engine — `WidgetEngine.tsx` renders widgets from `DashboardConfig`
- [x] Layout grid system — CSS Grid responsive 4-col layout via config
- [x] API binding — widget `api` field ready, mock data for demo

## Block

- [x] KPI Cards — `KpiCard.tsx` with trend indicator, icons, color variants
- [x] Chart (line/bar/area) — `ChartWidget.tsx` pure SVG, no external library
- [x] Table preview — `TablePreviewWidget.tsx` with status badges, view all link
- [x] Activity feed — `ActivityFeedWidget.tsx` timeline with icons, time ago
- [x] Quick action buttons — `QuickActionsWidget.tsx` grid of action cards

## Checklist

- [x] Config-driven dashboard layout (`dashboard.config.ts`)
- [x] Widget type system (KPI, Chart, Table, Activity, QuickActions)
- [x] Grid-based responsive layout (1→2→4 cols)
- [x] Dark/light theme compatible (design token colors)
- [x] Config preview panel (toggle JSON view)
- [x] Connection-aware (shows banner if no DB connected)
- [x] TypeScript strict — zero `any`, full type safety
- [x] Follows architecture rules (presentational widgets, smart page)

## Engine cần hỗ trợ

```ts
// ✅ IMPLEMENTED — see dashboard.config.ts
{
  type: "widget",
  layout: "grid",
  items: [
    { type: "kpi", api: "/stats/users" },
    { type: "chart", api: "/stats/orders" }
  ]
}
```

---

# 📋 2️⃣ GENERIC LIST PAGE (DynamicTable)

![Image](https://cdn.dribbble.com/userupload/28435008/file/original-fc024527e49bbc7ba564fd6220ed5ac3.png?resize=400x300)

![Image](https://screenshots.codesandbox.io/gjxt6/7.png)

![Image](https://cdn.dribbble.com/userupload/11237901/file/original-83ba57de94410eb7608535ee1ce6d3a5.jpg?format=webp&resize=400x300&vertical=center)

![Image](https://community.atlassian.com/forums/image/serverpage/image-id/348031i83018B150522A6DF/image-size/large?px=999&v=v2)

## 🎯 Đây là trái tim của Admin Core

## Tính năng bắt buộc

- [x] Column config từ metadata
- [x] Sort
- [x] Filter
- [x] Bulk action
- [x] Inline action
- [x] Pagination
- [x] Column hide/show
- [x] Density switch

## Advanced

- [x] Saved filter
- [x] Server-side mode
- [x] Virtual scroll
- [x] Export CSV

---

# 📝 3️⃣ GENERIC FORM PAGE (DynamicForm)

![Image](https://cdn.dribbble.com/userupload/43760060/file/original-d9a4de43ca64905bc9fe08865c8f2404.jpg?format=webp&resize=400x300&vertical=center)

![Image](https://cdn.prod.website-files.com/61cee5eb4d566d3471eca114/6745cbdd29d58e08ce081920_Frame%20427319094.png)

![Image](https://cdn.dribbble.com/userupload/46357156/file/1c547663c1213cddb1b2d3783192a215.png?format=webp&resize=400x300&vertical=center)

![Image](https://cdn.dribbble.com/userupload/46115658/file/73c1dd4791a00bcd863fd998a3a3ee29.png?crop=0x0-2129x1597&format=webp&resize=400x300&vertical=center)

## 🎯 Demo metadata-driven form

## Field Types

- [x] text
- [x] number
- [x] select
- [x] multi-select
- [x] relation
- [x] switch
- [x] date
- [x] rich text

## Advanced

- [x] Conditional field
- [x] Section grouping
- [x] Tabs form
- [x] Validation schema
- [x] Async select
- [x] Inline relation create

---

# 🔗 4️⃣ RELATION + NESTED CRUD SCREEN

![Image](https://i.sstatic.net/u0hdy.png)

![Image](https://pf3.patternfly.org/v3/pattern-library/forms-and-controls/inline-edit/img/List_Edit_00.png)

![Image](https://docs.devexpress.com/WindowsForms/images/ui-templates/master-detail-employee-toolbox.png)

![Image](https://static.infragistics.com/marketing/app-builder/blogs/1447.cards-view.gif)

## 🎯 Demo capability Phase 3

Ví dụ: Order

- User (ManyToOne)
- OrderItems (OneToMany inline table)
- Product (ManyToMany)

## Feature

- [ ] Inline row add
- [ ] Inline validation
- [ ] Nested transaction
- [ ] Optimistic update

---

# 🔍 5️⃣ QUERY BUILDER SCREEN (Enterprise)

![Image](https://raw.githubusercontent.com/dabernathy89/vue-query-builder/master/public/demo-screenshot.png)

![Image](https://cdn.dribbble.com/userupload/26273199/file/original-b43fd5f8a14d356d84b2acb5821ed8b8.png?resize=400x0)

![Image](https://i.sstatic.net/x1FAe.png)

![Image](https://help.bryter.io/hc/article_attachments/9212385382557)

## 🎯 Đây là điểm khác biệt platform-level

## Bắt buộc

- [ ] Condition row
- [ ] AND/OR group
- [ ] Nested group
- [ ] Relation field select
- [ ] Operator mapping

## AST Example

```ts
{
  type: "group",
  operator: "AND",
  children: [
    { field: "status", op: "=", value: "ACTIVE" },
    {
      type: "group",
      operator: "OR",
      children: [
        { field: "total", op: ">", value: 1000 }
      ]
    }
  ]
}
```

---

# ⚙ 6️⃣ SETTINGS MODULE

![Image](https://cdn.dribbble.com/userupload/14495136/file/original-108e739a5fedfb853e31efb16a1aa095.png?format=webp&resize=400x300&vertical=center)

![Image](https://docs.anchore.com/current/docs/configuration/user_management/ui/UIRolePermissionsTab.png)

![Image](https://www.outsystems.com/forge-assets/b04784b8-bb1d-4a52-b267-fc46f285e6e0/screenshots/fullsize_eebeda9a-c428-438d-99c3-1505f58f939e-20241212095809.png)

![Image](https://repository-images.githubusercontent.com/24594933/0ee96080-d406-11eb-856d-7df51ff2efbb)

## Modules

- User management
- Role/Permission
- Feature flag
- System config

## Engine cần support

- Permission guard
- Route guard
- Dynamic role-based field hide/show

---

# 🧩 7️⃣ MODULE CONFIG PREVIEW SCREEN

🎯 Rất quan trọng cho “platform mindset”

## Mục đích

Cho dev/user:

- Edit JSON config
- Live preview render
- Validate schema
- Export config

Giống “low-code lite mode”

---

# 🧠 Tổng hợp Screen Blueprint

| Screen         | Purpose              |
| -------------- | -------------------- |
| Layout         | Base shell           |
| Dashboard      | Widget engine demo   |
| List Page      | DynamicTable core    |
| Form Page      | Metadata form engine |
| Relation Page  | Nested CRUD demo     |
| Query Builder  | Enterprise feature   |
| Settings       | Permission system    |
| Config Preview | Platform mode        |

---

# 🎯 Nếu bạn muốn làm đúng Platform Level

Mình đề xuất thêm 2 màn hình nữa:

### 1️⃣ Command Palette Screen

- Global search module
- Quick create
- Navigate entity

### 2️⃣ Activity Log Screen

- System audit
- Change history
- Diff viewer

---

# 🚀 Nếu build đúng các màn hình trên

Bạn sẽ có:

- 1 Admin framework
- 1 Metadata engine
- 1 Enterprise Query Builder
- 1 Relation engine
- 1 Config-based platform
- 1 Extendable example app

---

Platform internal enterprise
