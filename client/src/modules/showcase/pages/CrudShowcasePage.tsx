import React, { useState, useCallback, useMemo } from 'react';
import {
  DynamicListView,
  DynamicCreateModal,
  DynamicEditModal,
  DeleteConfirmDialog,
} from '../../dynamic-crud';
import { BaseButton } from '../../../components/base';
import { schemaRegistry } from '../../../config/schema.config';
import type { EntitySchema } from '../../../core/metadata/schema.types';
import type { SortOption, FilterGroup } from '../../../types';
import toast from 'react-hot-toast';

// ============================================================
// CrudShowcasePage - Week 5 CRUD Engine Demo
// Demonstrates the full CRUD engine with mock data
// Shows: List, Create, Edit, Delete confirm, Bulk delete,
//        Filter, Sort, Pagination – all metadata-driven
// ============================================================

// ─── Mock Data Generators ─────────────────────────────────────

const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2025-01-15T10:30:00Z',
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-02-20T14:15:00Z',
  },
  {
    id: 3,
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-03-10T09:00:00Z',
  },
  {
    id: 4,
    username: 'viewer01',
    email: 'viewer@example.com',
    role: 'viewer',
    is_active: false,
    created_at: '2025-04-05T16:45:00Z',
  },
  {
    id: 5,
    username: 'mike_wilson',
    email: 'mike@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-05-12T11:20:00Z',
  },
  {
    id: 6,
    username: 'sarah_jones',
    email: 'sarah@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2025-06-08T08:30:00Z',
  },
  {
    id: 7,
    username: 'bob_brown',
    email: 'bob@example.com',
    role: 'viewer',
    is_active: false,
    created_at: '2025-07-22T13:10:00Z',
  },
  {
    id: 8,
    username: 'lisa_white',
    email: 'lisa@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-08-18T15:55:00Z',
  },
];

const MOCK_ORDERS = [
  {
    id: 1,
    order_number: 'ORD-001',
    user_id: 1,
    user: { id: 1, username: 'admin' },
    total: 1250.0,
    status: 'delivered',
    notes: 'Rush delivery',
    created_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 2,
    order_number: 'ORD-002',
    user_id: 2,
    user: { id: 2, username: 'john_doe' },
    total: 89.99,
    status: 'pending',
    notes: '',
    created_at: '2025-02-15T14:15:00Z',
  },
  {
    id: 3,
    order_number: 'ORD-003',
    user_id: 3,
    user: { id: 3, username: 'jane_smith' },
    total: 450.5,
    status: 'processing',
    notes: 'Gift wrapping',
    created_at: '2025-03-10T09:00:00Z',
  },
  {
    id: 4,
    order_number: 'ORD-004',
    user_id: 5,
    user: { id: 5, username: 'mike_wilson' },
    total: 2100.0,
    status: 'shipped',
    notes: '',
    created_at: '2025-04-05T16:45:00Z',
  },
  {
    id: 5,
    order_number: 'ORD-005',
    user_id: 2,
    user: { id: 2, username: 'john_doe' },
    total: 35.0,
    status: 'cancelled',
    notes: 'Customer changed mind',
    created_at: '2025-05-12T11:20:00Z',
  },
  {
    id: 6,
    order_number: 'ORD-006',
    user_id: 6,
    user: { id: 6, username: 'sarah_jones' },
    total: 780.25,
    status: 'pending',
    notes: '',
    created_at: '2025-06-08T08:30:00Z',
  },
];

const MOCK_CATEGORIES = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    parent_id: null,
    parent: null,
    description: 'Electronic devices',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Phones',
    slug: 'phones',
    parent_id: 1,
    parent: { id: 1, name: 'Electronics' },
    description: 'Mobile phones',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Laptops',
    slug: 'laptops',
    parent_id: 1,
    parent: { id: 1, name: 'Electronics' },
    description: 'Laptops and notebooks',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 4,
    name: 'Clothing',
    slug: 'clothing',
    parent_id: null,
    parent: null,
    description: 'Fashion and clothing',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 5,
    name: "Men's",
    slug: 'mens',
    parent_id: 4,
    parent: { id: 4, name: 'Clothing' },
    description: "Men's clothing",
    is_active: true,
    sort_order: 5,
  },
  {
    id: 6,
    name: "Women's",
    slug: 'womens',
    parent_id: 4,
    parent: { id: 4, name: 'Clothing' },
    description: "Women's clothing",
    is_active: true,
    sort_order: 6,
  },
  {
    id: 7,
    name: 'Books',
    slug: 'books',
    parent_id: null,
    parent: null,
    description: 'Books and media',
    is_active: false,
    sort_order: 7,
  },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: 'Latest Apple phone',
    price: 1199,
    category_id: 2,
    category: { id: 2, name: 'Phones' },
    tags: ['featured', 'new'],
    website: 'https://apple.com',
    metadata: '{"color":"black","storage":"256GB"}',
    is_active: true,
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    description: 'Ultra-thin laptop',
    price: 1299,
    category_id: 3,
    category: { id: 3, name: 'Laptops' },
    tags: ['featured', 'best-seller'],
    website: 'https://apple.com/mac',
    metadata: '{"ram":"16GB","ssd":"512GB"}',
    is_active: true,
    created_at: '2025-02-15T12:00:00Z',
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24',
    description: 'Samsung flagship',
    price: 899,
    category_id: 2,
    category: { id: 2, name: 'Phones' },
    tags: ['new'],
    website: 'https://samsung.com',
    metadata: '{"color":"white"}',
    is_active: true,
    created_at: '2025-03-20T08:00:00Z',
  },
  {
    id: 4,
    name: 'Levi 501 Jeans',
    description: 'Classic denim jeans',
    price: 79.99,
    category_id: 5,
    category: { id: 5, name: "Men's" },
    tags: ['best-seller'],
    website: '',
    metadata: null,
    is_active: true,
    created_at: '2025-04-05T14:00:00Z',
  },
  {
    id: 5,
    name: 'Summer Dress',
    description: 'Floral summer dress',
    price: 49.99,
    category_id: 6,
    category: { id: 6, name: "Women's" },
    tags: ['sale', 'new'],
    website: '',
    metadata: null,
    is_active: true,
    created_at: '2025-05-10T16:00:00Z',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockDataMap = Record<string, any[]>;

const MOCK_DATA: MockDataMap = {
  users: MOCK_USERS,
  orders: MOCK_ORDERS,
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
};

// Relation options derived from mock data
const RELATION_OPTIONS: Record<
  string,
  Record<string, Array<{ label: string; value: string | number }>>
> = {
  orders: {
    user_id: MOCK_USERS.map((u) => ({ label: u.username, value: u.id })),
  },
  categories: {
    parent_id: MOCK_CATEGORIES.map((c) => ({ label: c.name, value: c.id })),
  },
  products: {
    category_id: MOCK_CATEGORIES.filter((c) => c.is_active).map((c) => ({
      label: c.name,
      value: c.id,
    })),
  },
};

// ─── Entities available for demo ──────────────────────────────
const DEMO_ENTITIES = ['users', 'orders', 'categories', 'products'] as const;

export function CrudShowcasePage() {
  // ─── Active entity ────────────────────────────────────────
  const [activeEntity, setActiveEntity] = useState<string>('users');
  const schema = schemaRegistry[activeEntity] as EntitySchema;

  // ─── Mock CRUD state ──────────────────────────────────────
  const [mockData, setMockData] = useState<MockDataMap>({ ...MOCK_DATA });
  const [nextIds, setNextIds] = useState<Record<string, number>>({
    users: 9,
    orders: 7,
    categories: 8,
    products: 6,
  });

  // ─── Table state ──────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<SortOption[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // ─── Modal states ─────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletingRow, setDeletingRow] = useState<Record<string, any> | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset state when switching entity
  const handleEntityChange = useCallback((entity: string) => {
    setActiveEntity(entity);
    setPage(1);
    setSort([]);
    setSearch('');
    setSelectedRows([]);
    setCreateOpen(false);
    setEditingRow(null);
    setDeletingRow(null);
  }, []);

  // ─── Computed data with sort, search, pagination ──────────
  const { displayData, total } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items = [...(mockData[activeEntity] || [])] as any[];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((item) =>
        Object.values(item).some((v) =>
          typeof v === 'string'
            ? v.toLowerCase().includes(q)
            : typeof v === 'number'
              ? String(v).includes(q)
              : false,
        ),
      );
    }

    // Sort
    if (sort.length > 0) {
      const s = sort[0];
      items.sort((a, b) => {
        const va = a[s.field];
        const vb = b[s.field];
        if ((va === null || va === undefined) && (vb === null || vb === undefined)) return 0;
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        const cmp = typeof va === 'string' ? va.localeCompare(vb) : Number(va) - Number(vb);
        return s.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return { displayData: paginated, total };
  }, [mockData, activeEntity, search, sort, page, limit]);

  // ─── CRUD handlers (mock) ─────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreate = useCallback(
    async (data: Record<string, any>) => {
      setLoading(true);
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 500));
      const id = nextIds[activeEntity] || 1;
      const newItem = { id, ...data, created_at: new Date().toISOString() };
      setMockData((prev) => ({
        ...prev,
        [activeEntity]: [...(prev[activeEntity] || []), newItem],
      }));
      setNextIds((prev) => ({ ...prev, [activeEntity]: id + 1 }));
      setLoading(false);
      setCreateOpen(false);
      toast.success(`${schema.label} created successfully (ID: ${id})`);
    },
    [activeEntity, nextIds, schema.label],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = useCallback(
    async (data: Record<string, any>) => {
      if (!editingRow) return;
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      setMockData((prev) => ({
        ...prev,
        [activeEntity]: (prev[activeEntity] || []).map((item) =>
          item.id === editingRow.id ? { ...item, ...data } : item,
        ),
      }));
      setLoading(false);
      setEditingRow(null);
      toast.success(`${schema.label} updated successfully`);
    },
    [activeEntity, editingRow, schema.label],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingRow) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setMockData((prev) => ({
      ...prev,
      [activeEntity]: (prev[activeEntity] || []).filter((item) => item.id !== deletingRow.id),
    }));
    setLoading(false);
    setDeletingRow(null);
    toast.success(`${schema.label} deleted successfully`);
  }, [activeEntity, deletingRow, schema.label]);

  const handleBulkDelete = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const idSet = new Set(selectedRows.map(Number));
    setMockData((prev) => ({
      ...prev,
      [activeEntity]: (prev[activeEntity] || []).filter((item) => !idSet.has(item.id)),
    }));
    setLoading(false);
    setSelectedRows([]);
    setBulkDeleteOpen(false);
    toast.success(`Deleted ${selectedRows.length} ${schema.label.toLowerCase()}(s)`);
  }, [activeEntity, selectedRows, schema.label]);

  const handleFilter = useCallback((_filter: FilterGroup | null) => {
    // FilterGroup would be sent to API in production
    // For demo, we just reset to page 1
    setPage(1);
    toast.success('Filter applied (mock – search is used for demo filtering)');
  }, []);

  return (
    <div className="space-y-6">
      {/* ─── Page intro ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Week 5 – CRUD Engine Showcase</h1>
        <p className="text-sm text-primary-700 mb-3">
          Full metadata-driven CRUD engine with Dynamic List, Create, Edit, Delete. All UI is
          generated from EntitySchema config. Try switching entities below!
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
            ✓ Base API client
          </span>
          <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
            ✓ React Query integration
          </span>
          <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
            ✓ Dynamic list page
          </span>
          <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
            ✓ Dynamic create page
          </span>
          <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
            ✓ Dynamic edit page
          </span>
          <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
            ✓ Dynamic delete confirm
          </span>
        </div>
      </div>

      {/* ─── Entity selector ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">Entity:</span>
        {DEMO_ENTITIES.map((name) => {
          const sch = schemaRegistry[name];
          return (
            <BaseButton
              key={name}
              variant={activeEntity === name ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleEntityChange(name)}
            >
              {sch?.icon} {sch?.label || name}
            </BaseButton>
          );
        })}
      </div>

      {/* ─── Dynamic List View ───────────────────────────────── */}
      {schema && (
        <DynamicListView
          schema={schema}
          data={displayData}
          total={total}
          page={page}
          limit={limit}
          sort={sort}
          selectedRows={selectedRows}
          search={search}
          loading={false}
          canCreate={schema.permissions?.create !== false}
          canUpdate={schema.permissions?.update !== false}
          canDelete={schema.permissions?.delete !== false}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onSort={setSort}
          onFilter={handleFilter}
          onSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
          onRowSelect={setSelectedRows}
          onRowClick={(row) => setEditingRow(row)}
          onCreate={() => setCreateOpen(true)}
          onEdit={(row) => setEditingRow(row)}
          onDelete={(row) => setDeletingRow(row)}
          onBulkDelete={() => setBulkDeleteOpen(true)}
          onRefresh={() => toast.success('Data refreshed (mock)')}
        />
      )}

      {/* ─── Create Modal ────────────────────────────────────── */}
      {schema && (
        <DynamicCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          schema={schema}
          onSubmit={handleCreate}
          loading={loading}
          relationOptions={RELATION_OPTIONS[activeEntity] || {}}
        />
      )}

      {/* ─── Edit Modal ──────────────────────────────────────── */}
      {schema && (
        <DynamicEditModal
          open={Boolean(editingRow)}
          onClose={() => setEditingRow(null)}
          schema={schema}
          data={editingRow}
          onSubmit={handleEdit}
          loading={loading}
          relationOptions={RELATION_OPTIONS[activeEntity] || {}}
        />
      )}

      {/* ─── Delete Confirm ──────────────────────────────────── */}
      <DeleteConfirmDialog
        open={Boolean(deletingRow)}
        onClose={() => setDeletingRow(null)}
        onConfirm={handleDelete}
        loading={loading}
        entityLabel={schema?.label?.toLowerCase() || 'record'}
      />

      {/* ─── Bulk Delete Confirm ─────────────────────────────── */}
      <DeleteConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={loading}
        entityLabel={schema?.label?.toLowerCase() || 'record'}
        count={selectedRows.length}
      />

      {/* ─── Architecture info ───────────────────────────────── */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-bg-secondary px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Architecture Overview</h3>
        </div>
        <div className="p-4 text-sm text-text-secondary space-y-3">
          <div>
            <p className="font-medium text-text-primary mb-1">Data Flow:</p>
            <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
              {`EntitySchema (config)
  → useCrudEngine (orchestrator)
    → useCrud (React Query mutations + optimistic updates)
    → useEntitySchema (metadata resolution)
    → useRelationOptions (relation dropdowns)
    → useTableStore (Zustand: pagination, sort, filter)
  → DynamicCrudPage (smart page)
    → DynamicListView (table + filters)
    → DynamicCreateModal (create form)
    → DynamicEditModal (edit form)
    → DeleteConfirmDialog (confirmation)`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-text-primary mb-1">Key Files:</p>
            <ul className="text-xs space-y-1 ml-4 list-disc">
              <li>
                <code>core/api/crudService.ts</code> – Typed CRUD service layer
              </li>
              <li>
                <code>hooks/useCrud.ts</code> – React Query CRUD hook with optimistic updates
              </li>
              <li>
                <code>hooks/useCrudEngine.ts</code> – Full orchestrator combining schema + CRUD +
                relations + table state
              </li>
              <li>
                <code>modules/dynamic-crud/DynamicCrudPage.tsx</code> – Smart CRUD page composing
                all components
              </li>
              <li>
                <code>modules/dynamic-crud/DynamicListView.tsx</code> – Table + header + filters
              </li>
              <li>
                <code>modules/dynamic-crud/DynamicCreateModal.tsx</code> – Create form modal
              </li>
              <li>
                <code>modules/dynamic-crud/DynamicEditModal.tsx</code> – Edit form modal
              </li>
              <li>
                <code>modules/dynamic-crud/DeleteConfirmDialog.tsx</code> – Delete confirmation
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-primary mb-1">
              Current Schema: <code>{activeEntity}</code>
            </p>
            <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto max-h-40">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

CrudShowcasePage.displayName = 'CrudShowcasePage';
