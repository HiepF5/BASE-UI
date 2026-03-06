import React, { useState, useCallback, useMemo } from 'react';
import { BaseButton } from '../../../components/base';
import { RelationSelect } from '../../../components/relation/RelationSelect';
import { RelationMultiSelect } from '../../../components/relation/RelationMultiSelect';
import { RelationInlineTable } from '../../../components/relation/RelationInlineTable';
import { DynamicForm } from '../../../components/dynamic/DynamicForm';
import { schemaRegistry } from '../../../config/schema.config';
import toast from 'react-hot-toast';

// ============================================================
// RelationShowcasePage – Phase 3 Relation + Nested CRUD Demo
// Showcases: ManyToOne dropdown, OneToMany inline table,
//            ManyToMany multi-select, Nested transaction support
// ============================================================

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-bg-secondary px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── 1. ManyToOne Demo ───────────────────────────────────────

function ManyToOneDemo() {
  const [selectedUser, setSelectedUser] = useState<string | number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [selectedParentCat, setSelectedParentCat] = useState<string | number | null>(null);

  // Mock options (in real app these come from useRelationOptions)
  const userOptions = [
    { label: 'admin (admin@example.com)', value: 1 },
    { label: 'john_doe (john@example.com)', value: 2 },
    { label: 'jane_smith (jane@example.com)', value: 3 },
    { label: 'viewer01 (viewer@example.com)', value: 4 },
  ];

  const categoryOptions = [
    { label: 'Electronics', value: 1 },
    { label: 'Clothing', value: 2 },
    { label: 'Books', value: 3 },
    { label: 'Home & Garden', value: 4 },
    { label: 'Sports', value: 5 },
  ];

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-secondary">
        <strong>RelationSelect</strong> – Async searchable dropdown for ManyToOne / OneToOne
        relations. Features: preloaded options, debounced server-side search, keyboard navigation
        (↑↓ Enter Esc), clear button, optional "Create new" action.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Order → User (ManyToOne) */}
        <div>
          <RelationSelect
            label="Customer (Order → User)"
            value={selectedUser}
            onChange={setSelectedUser}
            options={userOptions}
            placeholder="Select customer..."
            targetEntity="users"
            displayField="username"
            connectionId="default"
          />
          <p className="text-xs text-text-muted mt-1">Selected: {selectedUser ?? 'none'}</p>
        </div>

        {/* Product → Category (ManyToOne) */}
        <div>
          <RelationSelect
            label="Product Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            placeholder="Select category..."
            targetEntity="categories"
            displayField="name"
            connectionId="default"
            required
          />
          <p className="text-xs text-text-muted mt-1">Selected: {selectedCategory ?? 'none'}</p>
        </div>

        {/* Category → Parent (Self-relation ManyToOne) */}
        <div>
          <RelationSelect
            label="Parent Category (Self-Relation)"
            value={selectedParentCat}
            onChange={setSelectedParentCat}
            options={categoryOptions}
            placeholder="Select parent..."
            targetEntity="categories"
            displayField="name"
            connectionId="default"
            allowCreate
            onCreateNew={() => toast.success('Open create category modal!')}
          />
          <p className="text-xs text-text-muted mt-1">
            Selected: {selectedParentCat ?? 'none'} (with allowCreate)
          </p>
        </div>
      </div>

      {/* Code snippet */}
      <details className="text-xs">
        <summary className="cursor-pointer text-primary-600 font-medium">View Code</summary>
        <pre className="bg-bg-secondary p-3 rounded-lg mt-2 overflow-x-auto text-[11px] leading-relaxed">
          {`<RelationSelect
  label="Customer"
  value={selectedUser}
  onChange={setSelectedUser}
  options={userOptions}         // preloaded from useRelationOptions
  targetEntity="users"          // async search endpoint
  displayField="username"       // label resolution
  connectionId="default"
  allowCreate                   // optional "Create new" button
  onCreateNew={() => openCreateModal()}
/>`}
        </pre>
      </details>
    </div>
  );
}

// ─── 2. ManyToMany Demo ──────────────────────────────────────

function ManyToManyDemo() {
  const [selectedTags, setSelectedTags] = useState<Array<string | number>>([1, 3]);

  const tagOptions = [
    { label: 'Featured', value: 1 },
    { label: 'New Arrival', value: 2 },
    { label: 'Sale', value: 3 },
    { label: 'Best Seller', value: 4 },
    { label: 'Limited Edition', value: 5 },
    { label: 'Seasonal', value: 6 },
  ];

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-secondary">
        <strong>RelationMultiSelect</strong> – Async searchable multi-select for ManyToMany
        relations. Features: removable chips, debounced search, keyboard nav (Backspace removes
        last), max selection limit, excludes already-selected from dropdown.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <RelationMultiSelect
            label="Product Tags (ManyToMany)"
            value={selectedTags}
            onChange={setSelectedTags}
            options={tagOptions}
            placeholder="Search and select tags..."
            targetEntity="tags"
            displayField="name"
            connectionId="default"
          />
          <p className="text-xs text-text-muted mt-1">Selected IDs: [{selectedTags.join(', ')}]</p>
        </div>

        <div>
          <RelationMultiSelect
            label="Tags (max 3)"
            value={selectedTags.slice(0, 3)}
            onChange={(val) => setSelectedTags(val)}
            options={tagOptions}
            placeholder="Max 3 tags..."
            targetEntity="tags"
            displayField="name"
            connectionId="default"
            max={3}
          />
          <p className="text-xs text-text-muted mt-1">With max=3 limit</p>
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-primary-600 font-medium">View Code</summary>
        <pre className="bg-bg-secondary p-3 rounded-lg mt-2 overflow-x-auto text-[11px] leading-relaxed">
          {`<RelationMultiSelect
  label="Product Tags"
  value={selectedTags}
  onChange={setSelectedTags}
  options={tagOptions}           // preloaded from useRelationOptions
  targetEntity="tags"            // async search
  displayField="name"
  connectionId="default"
  max={5}                        // optional selection limit
/>`}
        </pre>
      </details>
    </div>
  );
}

// ─── 3. OneToMany Demo ───────────────────────────────────────

function OneToManyDemo() {
  // Simulate a saved parent record with ID
  const [parentId, setParentId] = useState<string | number | null>(1);

  // Get the OneToMany field from Orders schema (items)
  const ordersSchema = schemaRegistry.orders;
  const itemsField = useMemo(
    () => ordersSchema.fields.find((f) => f.name === 'items' && f.relation?.type === 'OneToMany'),
    [ordersSchema],
  );

  // Get self-relation OneToMany from Categories (children)
  const categoriesSchema = schemaRegistry.categories;
  const childrenField = useMemo(
    () =>
      categoriesSchema.fields.find(
        (f) => f.name === 'children' && f.relation?.type === 'OneToMany',
      ),
    [categoriesSchema],
  );

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-secondary">
        <strong>RelationInlineTable</strong> – Embedded CRUD table for OneToMany child records.
        Features: auto FK injection on create, add/edit via modal, delete confirmation, child entity
        schema-driven columns, compact mode, loading states.
      </p>

      {/* Toggle parent saved state */}
      <div className="flex items-center gap-3">
        <BaseButton
          size="sm"
          variant={parentId ? 'secondary' : 'primary'}
          onClick={() => setParentId(parentId ? null : 1)}
        >
          {parentId ? 'Simulate Unsaved Parent' : 'Simulate Saved Parent (id=1)'}
        </BaseButton>
        <span className="text-xs text-text-muted">
          Parent ID: {parentId ?? 'null (not saved yet)'}
        </span>
      </div>

      {/* Order Items inline table */}
      {itemsField && (
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">
            Order → Order Items (OneToMany)
          </p>
          <RelationInlineTable field={itemsField} parentId={parentId} connectionId="default" />
        </div>
      )}

      {/* Self-relation: Category → Children */}
      {childrenField && (
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">
            Category → Sub-categories (Self-Relation OneToMany)
          </p>
          <RelationInlineTable
            field={childrenField}
            parentId={parentId}
            connectionId="default"
            compact
          />
        </div>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-primary-600 font-medium">View Code</summary>
        <pre className="bg-bg-secondary p-3 rounded-lg mt-2 overflow-x-auto text-[11px] leading-relaxed">
          {`// In DynamicForm – auto-rendered for OneToMany fields
<RelationInlineTable
  field={field}            // FieldSchema with relation.type = 'OneToMany'
  parentId={parentId}      // null → shows "save first" placeholder
  connectionId="default"
  compact                  // optional compact mode
/>

// Hook powering it:
const crud = useRelationCrud('order_items', {
  parentId: orderId,
  foreignKey: 'order_id',  // auto-injected on child create
  connectionId: 'default',
});
// crud.data, crud.create, crud.update, crud.remove`}
        </pre>
      </details>
    </div>
  );
}

// ─── 4. Nested Transaction Demo ──────────────────────────────

function NestedTransactionDemo() {
  const [showForm, setShowForm] = useState(false);
  const ordersSchema = schemaRegistry.orders;

  const handleNestedSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: Record<string, any>) => {
      // Simulate nested save
      toast.success(`Nested save: parent data = ${JSON.stringify(data).slice(0, 100)}...`);
      setShowForm(false);
    },
    [],
  );

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-secondary">
        <strong>useNestedCrud</strong> – Hook for saving parent + children in a single transaction.
        Tries <code className="bg-bg-secondary px-1 rounded">POST /nested</code> first, falls back
        to sequential create (parent → children). Supports nested update with child operations
        (create/update/delete in parallel).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4">
          <h4 className="text-xs font-semibold text-text-primary mb-3">Nested Create Flow</h4>
          <ol className="text-xs text-text-secondary space-y-1.5 list-decimal list-inside">
            <li>User fills parent form + adds child rows via inline tables</li>
            <li>
              <code className="bg-bg-secondary px-1 rounded">
                useNestedCrud.nestedCreate(payload)
              </code>{' '}
              called
            </li>
            <li>
              Tries{' '}
              <code className="bg-bg-secondary px-1 rounded">POST /crud/:conn/:entity/nested</code>
            </li>
            <li>If 404 → sequential fallback: create parent, then children with FK injection</li>
            <li>All query caches invalidated on success</li>
          </ol>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="text-xs font-semibold text-text-primary mb-3">Nested Update Flow</h4>
          <ol className="text-xs text-text-secondary space-y-1.5 list-decimal list-inside">
            <li>Parent data updated via PUT</li>
            <li>Child operations processed in parallel:</li>
            <li className="ml-4">
              • <strong>create</strong> – POST new child with FK
            </li>
            <li className="ml-4">
              • <strong>update</strong> – PUT existing child by ID
            </li>
            <li className="ml-4">
              • <strong>delete</strong> – DELETE child by ID
            </li>
            <li>Query invalidation after all ops complete</li>
          </ol>
        </div>
      </div>

      <div>
        <BaseButton size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hide' : 'Show'} Nested Order Form
        </BaseButton>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-4">
          <DynamicForm
            schema={ordersSchema}
            mode="edit"
            defaultValues={{
              id: 1,
              order_number: 'ORD-001',
              status: 'pending',
              total: 299.99,
            }}
            onSubmit={handleNestedSubmit}
            onCancel={() => setShowForm(false)}
            layout="grid"
            parentId={1}
            connectionId="default"
          />
        </div>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-primary-600 font-medium">View Code</summary>
        <pre className="bg-bg-secondary p-3 rounded-lg mt-2 overflow-x-auto text-[11px] leading-relaxed">
          {`import { useNestedCrud } from '../../../hooks/useNestedCrud';

const { nestedCreate, nestedUpdate, buildNestedPayload } = useNestedCrud({
  entity: 'orders',
  schema: ordersSchema,
  connectionId: 'default',
});

// Nested create (parent + children in one go)
const payload = buildNestedPayload(parentData, {
  order_items: [
    { product_name: 'Item 1', quantity: 2, price: 49.99 },
    { product_name: 'Item 2', quantity: 1, price: 199.99 },
  ],
});
await nestedCreate(payload);

// Nested update (parent + child operations)
await nestedUpdate(orderId, updatedParentData, [
  { type: 'create', entity: 'order_items', foreignKey: 'order_id',
    data: { product_name: 'New Item', quantity: 1, price: 29.99 } },
  { type: 'update', entity: 'order_items', foreignKey: 'order_id',
    id: 5, data: { quantity: 3 } },
  { type: 'delete', entity: 'order_items', foreignKey: 'order_id', id: 8 },
]);`}
        </pre>
      </details>
    </div>
  );
}

// ─── 5. DynamicForm Integration ──────────────────────────────

function DynamicFormIntegrationDemo() {
  const productsSchema = schemaRegistry.products;

  // Mock relation options
  const mockRelationOptions: Record<string, Array<{ label: string; value: string | number }>> = {
    category_id: [
      { label: 'Electronics', value: 1 },
      { label: 'Clothing', value: 2 },
      { label: 'Books', value: 3 },
    ],
    tags: [
      { label: 'Featured', value: 1 },
      { label: 'New', value: 2 },
      { label: 'Sale', value: 3 },
      { label: 'Best Seller', value: 4 },
    ],
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-secondary">
        <strong>DynamicForm</strong> now auto-renders <strong>RelationSelect</strong> for ManyToOne
        and <strong>RelationMultiSelect</strong> for ManyToMany via the updated{' '}
        <strong>FieldRenderer</strong>. OneToMany fields render as{' '}
        <strong>RelationInlineTable</strong> below the form.
      </p>

      <div className="border border-border rounded-lg p-4">
        <DynamicForm
          schema={productsSchema}
          mode="create"
          onSubmit={async (data) => {
            toast.success(`Product data: ${JSON.stringify(data).slice(0, 150)}...`);
          }}
          layout="grid"
          relationOptions={mockRelationOptions}
          connectionId="default"
        />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export function RelationShowcasePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">🔗 Phase 3: Relation + Nested CRUD</h1>
        <p className="text-sm text-text-secondary mt-1">
          Enterprise-grade relation handling: ManyToOne dropdown, OneToMany inline table, ManyToMany
          multi-select, and nested transaction support.
        </p>
      </div>

      {/* Feature summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🔽', label: 'ManyToOne Select', desc: 'Async searchable dropdown' },
          { icon: '📋', label: 'OneToMany Table', desc: 'Inline CRUD table' },
          { icon: '🏷️', label: 'ManyToMany Multi', desc: 'Chips + async search' },
          { icon: '💾', label: 'Nested Transaction', desc: 'Parent+children save' },
        ].map((item) => (
          <div key={item.label} className="border border-border rounded-lg p-3 text-center bg-bg">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-semibold text-text-primary">{item.label}</p>
            <p className="text-[10px] text-text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <Section
        title="1. ManyToOne – RelationSelect"
        description="Async searchable dropdown for ManyToOne / OneToOne relations with keyboard navigation"
      >
        <ManyToOneDemo />
      </Section>

      <Section
        title="2. ManyToMany – RelationMultiSelect"
        description="Async multi-select with chips for ManyToMany relations (e.g., Product ↔ Tags)"
      >
        <ManyToManyDemo />
      </Section>

      <Section
        title="3. OneToMany – RelationInlineTable"
        description="Inline CRUD table for child records with auto FK injection (e.g., Order → Items)"
      >
        <OneToManyDemo />
      </Section>

      <Section
        title="4. Nested Transaction – useNestedCrud"
        description="Save parent + children in a single transaction (nested endpoint or sequential fallback)"
      >
        <NestedTransactionDemo />
      </Section>

      <Section
        title="5. DynamicForm Integration"
        description="DynamicForm auto-renders RelationSelect, RelationMultiSelect, and RelationInlineTable from schema metadata"
      >
        <DynamicFormIntegrationDemo />
      </Section>

      {/* Architecture overview */}
      <Section
        title="Architecture Overview"
        description="Component + hook architecture for relation handling"
      >
        <pre className="text-[11px] leading-relaxed bg-bg-secondary p-4 rounded-lg overflow-x-auto">
          {`┌─────────────────────────────────────────────────────────────┐
│  DynamicForm / DynamicCrudPage                              │
│  ├── FieldRenderer                                          │
│  │   ├── relation(ManyToOne)  → <RelationSelect />          │
│  │   ├── relation(ManyToMany) → <RelationMultiSelect />     │
│  │   └── relation(OneToMany)  → (skip – rendered below)     │
│  └── RelationInlineTable (for each OneToMany field)         │
│       ├── useRelationCrud (child CRUD with FK filter)       │
│       ├── InlineForm (add/edit modals)                      │
│       └── Delete confirmation                               │
├─────────────────────────────────────────────────────────────┤
│  Hooks Layer                                                │
│  ├── useRelationCrud    → React Query child CRUD + FK auto  │
│  ├── useNestedCrud      → Parent+children atomic save       │
│  ├── useRelationOptions → Preload options for select fields │
│  └── useCrudEngine      → Orchestrates schema+CRUD+relation │
├─────────────────────────────────────────────────────────────┤
│  Metadata Layer                                             │
│  ├── EntitySchema.fields[].relation → RelationFieldSchema   │
│  ├── relation-mapping.ts utilities                          │
│  └── schemaRegistry (static/auto-generated)                 │
└─────────────────────────────────────────────────────────────┘`}
        </pre>
      </Section>
    </div>
  );
}

RelationShowcasePage.displayName = 'RelationShowcasePage';
