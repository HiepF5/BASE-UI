import React, { useState, useCallback, useMemo } from 'react';
import {
  BaseButton,
  BaseTable,
  BaseFilterBar,
  BaseAlert,
  ColumnVisibilityDropdown,
  DensitySwitch,
  SavedFilters,
} from '../../components/base';
import type { TableDensity } from '../../components/base/DensitySwitch';
import { schemaRegistry } from '../../config/schema.config';
import { entitySchemaToColumnConfigs } from '../../core/metadata';
import { downloadCSV } from '../../core/utils/export-csv';
import type { ColumnConfig, SortOption, FilterGroup } from '../../types';
import type { EntitySchema } from '../../core/metadata/schema.types';
import toast from 'react-hot-toast';

// ============================================================
// GenericListShowcasePage — 📋 2️⃣ GENERIC LIST PAGE (DynamicTable)
//
// Demonstrates ALL blueprint features:
// Required: Column config từ metadata, Sort, Filter, Bulk action,
//           Inline action, Pagination, Column hide/show, Density switch
// Advanced: Saved filter, Server-side mode (simulated), Export CSV
// ============================================================

// ─── Mock Data ────────────────────────────────────────────────

interface MockUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const MOCK_USERS: MockUser[] = [
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
  {
    id: 9,
    username: 'tom_lee',
    email: 'tom@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-09-01T07:00:00Z',
  },
  {
    id: 10,
    username: 'anna_black',
    email: 'anna@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2025-09-15T10:00:00Z',
  },
  {
    id: 11,
    username: 'chris_green',
    email: 'chris@example.com',
    role: 'viewer',
    is_active: false,
    created_at: '2025-10-02T12:30:00Z',
  },
  {
    id: 12,
    username: 'diana_king',
    email: 'diana@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-10-20T09:45:00Z',
  },
  {
    id: 13,
    username: 'eric_hall',
    email: 'eric@example.com',
    role: 'user',
    is_active: true,
    created_at: '2025-11-05T14:00:00Z',
  },
  {
    id: 14,
    username: 'fiona_clark',
    email: 'fiona@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2025-11-18T16:20:00Z',
  },
  {
    id: 15,
    username: 'george_moore',
    email: 'george@example.com',
    role: 'viewer',
    is_active: false,
    created_at: '2025-12-01T08:15:00Z',
  },
];

interface MockProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 1199,
    category: 'Phones',
    stock: 45,
    is_active: true,
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    price: 1299,
    category: 'Laptops',
    stock: 30,
    is_active: true,
    created_at: '2025-02-15T12:00:00Z',
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24',
    price: 899,
    category: 'Phones',
    stock: 60,
    is_active: true,
    created_at: '2025-03-20T08:00:00Z',
  },
  {
    id: 4,
    name: 'Levi 501 Jeans',
    price: 79.99,
    category: "Men's",
    stock: 200,
    is_active: true,
    created_at: '2025-04-05T14:00:00Z',
  },
  {
    id: 5,
    name: 'Summer Dress',
    price: 49.99,
    category: "Women's",
    stock: 150,
    is_active: true,
    created_at: '2025-05-10T16:00:00Z',
  },
  {
    id: 6,
    name: 'ThinkPad X1 Carbon',
    price: 1450,
    category: 'Laptops',
    stock: 20,
    is_active: true,
    created_at: '2025-05-22T09:30:00Z',
  },
  {
    id: 7,
    name: 'AirPods Pro 2',
    price: 249,
    category: 'Audio',
    stock: 100,
    is_active: true,
    created_at: '2025-06-14T11:00:00Z',
  },
  {
    id: 8,
    name: 'Sony WH-1000XM5',
    price: 348,
    category: 'Audio',
    stock: 55,
    is_active: true,
    created_at: '2025-07-01T13:45:00Z',
  },
  {
    id: 9,
    name: 'Pixel 8 Pro',
    price: 999,
    category: 'Phones',
    stock: 35,
    is_active: true,
    created_at: '2025-07-20T10:15:00Z',
  },
  {
    id: 10,
    name: 'Nintendo Switch',
    price: 299,
    category: 'Gaming',
    stock: 80,
    is_active: true,
    created_at: '2025-08-05T15:00:00Z',
  },
  {
    id: 11,
    name: 'PS5 DualSense',
    price: 69.99,
    category: 'Gaming',
    stock: 120,
    is_active: true,
    created_at: '2025-08-20T08:30:00Z',
  },
  {
    id: 12,
    name: 'Dell Monitor 27"',
    price: 299,
    category: 'Monitors',
    stock: 40,
    is_active: false,
    created_at: '2025-09-10T14:20:00Z',
  },
];

// ─── Product column config (inline, not from schema) ──────────
const PRODUCT_COLUMNS: ColumnConfig[] = [
  {
    name: 'id',
    label: 'ID',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: false,
    editable: false,
    required: false,
    width: 60,
  },
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'price',
    label: 'Price ($)',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
    options: [
      { label: 'Phones', value: 'Phones' },
      { label: 'Laptops', value: 'Laptops' },
      { label: 'Audio', value: 'Audio' },
      { label: 'Gaming', value: 'Gaming' },
      { label: 'Monitors', value: 'Monitors' },
      { label: "Men's", value: "Men's" },
      { label: "Women's", value: "Women's" },
    ],
  },
  {
    name: 'stock',
    label: 'Stock',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
  },
  {
    name: 'is_active',
    label: 'Active',
    type: 'boolean',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
  },
  {
    name: 'created_at',
    label: 'Created At',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
  },
];

// ─── Dataset configs ──────────────────────────────────────────
type DatasetKey = 'users' | 'products';

interface DatasetConfig {
  label: string;
  icon: string;
  description: string;
  data: Record<string, unknown>[];
  getColumns: () => ColumnConfig[];
  entityName: string;
}

function getUserColumns(): ColumnConfig[] {
  const schema = schemaRegistry['users'] as EntitySchema | undefined;
  if (schema) return entitySchemaToColumnConfigs(schema);
  // Fallback if schema not found
  return [
    {
      name: 'id',
      label: 'ID',
      type: 'number',
      visible: true,
      sortable: true,
      filterable: false,
      editable: false,
      required: false,
      width: 60,
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'boolean',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: false,
    },
    {
      name: 'created_at',
      label: 'Created At',
      type: 'date',
      visible: true,
      sortable: true,
      filterable: true,
      editable: false,
      required: false,
    },
  ];
}

const DATASETS: Record<DatasetKey, DatasetConfig> = {
  users: {
    label: 'Users',
    icon: '👤',
    description: '15 users – column config from EntitySchema metadata',
    data: MOCK_USERS as unknown as Record<string, unknown>[],
    getColumns: getUserColumns,
    entityName: 'users',
  },
  products: {
    label: 'Products',
    icon: '📦',
    description: '12 products – inline column config',
    data: MOCK_PRODUCTS as unknown as Record<string, unknown>[],
    getColumns: () => [...PRODUCT_COLUMNS],
    entityName: 'products',
  },
};

// ─── Section Component ────────────────────────────────────────

function Section({
  title,
  description,
  children,
  badge,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-bg-secondary px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {badge && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Feature Badge ────────────────────────────────────────────

function FeatureBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        active ? 'bg-success/10 text-success' : 'bg-neutral-100 text-text-muted'
      }`}
    >
      {active ? '✓' : '○'} {label}
    </span>
  );
}

// ============================================================
// Main Component
// ============================================================

export function GenericListShowcasePage() {
  // ─── Dataset selector ─────────────────────────────────────
  const [activeDataset, setActiveDataset] = useState<DatasetKey>('users');
  const dataset = DATASETS[activeDataset];

  // ─── Column visibility state (mutable copy) ───────────────
  const [columnOverrides, setColumnOverrides] = useState<
    Record<DatasetKey, Record<string, boolean>>
  >({
    users: {},
    products: {},
  });

  // ─── Table state ──────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sort, setSort] = useState<SortOption[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterGroup | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [density, setDensity] = useState<TableDensity>('normal');
  const [loading, setLoading] = useState(false);
  const [serverSideMode, setServerSideMode] = useState(false);

  // ─── Compute columns with visibility overrides ────────────
  const columns = useMemo(() => {
    const base = dataset.getColumns();
    const overrides = columnOverrides[activeDataset];
    return base.map((col) => ({
      ...col,
      visible: overrides[col.name] !== undefined ? overrides[col.name] : col.visible,
    }));
  }, [dataset, activeDataset, columnOverrides]);

  // ─── Reset when switching dataset ─────────────────────────
  const handleDatasetChange = useCallback((key: DatasetKey) => {
    setActiveDataset(key);
    setPage(1);
    setSort([]);
    setSearch('');
    setFilter(null);
    setSelectedRows([]);
  }, []);

  // ─── Column visibility toggle ─────────────────────────────
  const handleColumnToggle = useCallback(
    (name: string, visible: boolean) => {
      setColumnOverrides((prev) => ({
        ...prev,
        [activeDataset]: { ...prev[activeDataset], [name]: visible },
      }));
    },
    [activeDataset],
  );

  const handleResetColumns = useCallback(() => {
    setColumnOverrides((prev) => ({
      ...prev,
      [activeDataset]: {},
    }));
  }, [activeDataset]);

  // ─── Computed data (sort + search + filter + paginate) ────
  const { displayData, total, allFilteredData } = useMemo(() => {
    let items = [...dataset.data];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((item) =>
        Object.values(item).some((v) => {
          if (typeof v === 'string') return v.toLowerCase().includes(q);
          if (typeof v === 'number') return String(v).includes(q);
          return false;
        }),
      );
    }

    // Filter
    if (filter) {
      items = items.filter((item) =>
        filter.conditions.every((cond) => {
          if ('logic' in cond) return true; // Nested group – skip for demo
          const val = item[cond.field];
          const condVal = (cond as { value: unknown }).value;
          switch (cond.operator) {
            case 'eq':
              return String(val) === String(condVal);
            case 'neq':
              return String(val) !== String(condVal);
            case 'like':
              return String(val).toLowerCase().includes(String(condVal).toLowerCase());
            case 'gt':
              return Number(val) > Number(condVal);
            case 'gte':
              return Number(val) >= Number(condVal);
            case 'lt':
              return Number(val) < Number(condVal);
            case 'lte':
              return Number(val) <= Number(condVal);
            case 'isNull':
              return val === null || val === undefined;
            default:
              return true;
          }
        }),
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
        const cmp =
          typeof va === 'string'
            ? (va as string).localeCompare(vb as string)
            : Number(va) - Number(vb);
        return s.direction === 'desc' ? -cmp : cmp;
      });
    }

    const allFilteredData = [...items];
    const total = items.length;
    const start = (page - 1) * limit;
    const displayData = items.slice(start, start + limit);
    return { displayData, total, allFilteredData };
  }, [dataset.data, search, filter, sort, page, limit]);

  // ─── Server-side simulation ───────────────────────────────
  const handleServerSideToggle = useCallback(() => {
    setServerSideMode((prev) => {
      const next = !prev;
      if (next) {
        // Simulate server-side loading on every change
        setLoading(true);
        setTimeout(() => setLoading(false), 600);
      }
      return next;
    });
  }, []);

  // Simulate server latency when page/sort/filter change
  const simulateServerLoad = useCallback(() => {
    if (!serverSideMode) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }, [serverSideMode]);

  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);
      simulateServerLoad();
    },
    [simulateServerLoad],
  );

  const handleLimitChange = useCallback(
    (l: number) => {
      setLimit(l);
      setPage(1);
      simulateServerLoad();
    },
    [simulateServerLoad],
  );

  const handleSortChange = useCallback(
    (s: SortOption[]) => {
      setSort(s);
      simulateServerLoad();
    },
    [simulateServerLoad],
  );

  const handleFilterChange = useCallback(
    (f: FilterGroup | null) => {
      setFilter(f);
      setPage(1);
      simulateServerLoad();
    },
    [simulateServerLoad],
  );

  // ─── Bulk actions ─────────────────────────────────────────
  const handleBulkDelete = useCallback(() => {
    toast.success(`Deleted ${selectedRows.length} items (mock)`);
    setSelectedRows([]);
  }, [selectedRows]);

  const handleBulkExport = useCallback(() => {
    const selected = allFilteredData.filter((row) => selectedRows.includes(String(row['id'])));
    downloadCSV(selected, columns, `${activeDataset}-selected.csv`);
    toast.success(`Exported ${selected.length} rows`);
  }, [selectedRows, allFilteredData, columns, activeDataset]);

  // ─── Inline actions ───────────────────────────────────────
  const handleEdit = useCallback((row: Record<string, unknown>) => {
    toast(`Edit: ${row['username'] || row['name']} (mock)`, { icon: '✏️' });
  }, []);

  const handleDelete = useCallback((row: Record<string, unknown>) => {
    toast(`Delete: ${row['username'] || row['name']} (mock)`, { icon: '🗑️' });
  }, []);

  // ─── Export CSV ───────────────────────────────────────────
  const handleExportAll = useCallback(() => {
    downloadCSV(allFilteredData, columns, `${activeDataset}-export.csv`);
    toast.success(`Exported ${allFilteredData.length} rows to CSV`);
  }, [allFilteredData, columns, activeDataset]);

  // ─── Saved filters ───────────────────────────────────────
  const handleApplySavedFilter = useCallback(
    (f: FilterGroup) => {
      setFilter(f);
      setPage(1);
      simulateServerLoad();
      toast.success('Saved filter applied');
    },
    [simulateServerLoad],
  );

  // ─── Feature status ──────────────────────────────────────
  const features = useMemo(
    () => ({
      'Column Config': true,
      Sort: sort.length > 0,
      Filter: filter !== null,
      'Bulk Action': selectedRows.length > 0,
      'Inline Action': true,
      Pagination: true,
      'Column Hide/Show': Object.keys(columnOverrides[activeDataset]).length > 0,
      'Density Switch': density !== 'normal',
      'Saved Filter': true,
      'Server-Side': serverSideMode,
      'Export CSV': true,
    }),
    [sort, filter, selectedRows, columnOverrides, activeDataset, density, serverSideMode],
  );

  return (
    <div className="space-y-6">
      {/* ─── Page Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          📋 Generic List Page (DynamicTable)
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Heart of Admin Core — Metadata-driven table with full features
        </p>
      </div>

      {/* ─── Feature Status Bar ────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(features).map(([label, active]) => (
          <FeatureBadge key={label} label={label} active={active} />
        ))}
      </div>

      {/* ─── Dataset Selector ──────────────────────────────── */}
      <Section
        title="Dataset Selector"
        description="Switch between entities to test column config from metadata vs inline config"
        badge="Column Config"
      >
        <div className="flex gap-3">
          {(Object.entries(DATASETS) as [DatasetKey, DatasetConfig][]).map(([key, ds]) => (
            <button
              key={key}
              onClick={() => handleDatasetChange(key)}
              className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                activeDataset === key
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-border hover:border-neutral-300'
              }`}
            >
              <span className="text-lg">{ds.icon}</span>
              <span className="ml-2 font-medium text-sm">{ds.label}</span>
              <p className="text-xs text-text-muted mt-1">{ds.description}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* ─── Toolbar ───────────────────────────────────────── */}
      <Section
        title="Table Toolbar"
        description="Column visibility, density, filters, bulk actions, export"
        badge="Controls"
      >
        <div className="space-y-3">
          {/* Row 1: Search + Filter + Controls */}
          <div className="flex items-center gap-2">
            <BaseFilterBar
              columns={columns}
              onFilter={handleFilterChange}
              onSearch={(text) => {
                setSearch(text);
                setPage(1);
                simulateServerLoad();
              }}
              searchValue={search}
            />
          </div>

          {/* Row 2: Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ColumnVisibilityDropdown
                columns={columns}
                onToggle={handleColumnToggle}
                onResetAll={handleResetColumns}
              />
              <DensitySwitch value={density} onChange={setDensity} />
              <SavedFilters
                entityName={`showcase-${activeDataset}`}
                currentFilter={filter}
                onApply={handleApplySavedFilter}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Server-side mode toggle */}
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={serverSideMode}
                  onChange={handleServerSideToggle}
                  className="rounded border-border text-primary-600"
                />
                <span className="text-text-secondary">Server-side mode</span>
              </label>

              {/* Bulk actions */}
              {selectedRows.length > 0 && (
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <span className="text-xs text-text-muted">{selectedRows.length} selected</span>
                  <BaseButton size="sm" variant="outline" onClick={handleBulkExport}>
                    Export Selected
                  </BaseButton>
                  <BaseButton size="sm" variant="outline" onClick={handleBulkDelete}>
                    Delete Selected
                  </BaseButton>
                </div>
              )}

              <BaseButton size="sm" variant="outline" onClick={handleExportAll}>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export CSV
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Table ─────────────────────────────────────────── */}
      <Section
        title={`${dataset.icon} ${dataset.label} Table`}
        description={`${total} records — Page ${page} of ${Math.max(1, Math.ceil(total / limit))} — Density: ${density}`}
        badge={sort.length > 0 ? `Sorted by ${sort[0].field} ${sort[0].direction}` : undefined}
      >
        {serverSideMode && (
          <BaseAlert variant="info" className="mb-3">
            <span className="text-xs">
              <strong>Server-side mode ON</strong> — Every page/sort/filter change simulates a 400ms
              server request with loading state.
            </span>
          </BaseAlert>
        )}

        <BaseTable
          columns={columns}
          data={displayData}
          total={total}
          page={page}
          limit={limit}
          sort={sort}
          selectedRows={selectedRows}
          loading={loading}
          primaryKey="id"
          striped
          compact={density === 'compact'}
          showPagination
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onSort={handleSortChange}
          onRowSelect={setSelectedRows}
          onRowClick={(row) => toast(`Clicked: ${row['username'] || row['name']}`, { icon: '👆' })}
          onEdit={handleEdit}
          onDelete={handleDelete}
          className={density === 'spacious' ? '[&_td]:py-4 [&_th]:py-4' : undefined}
        />
      </Section>

      {/* ─── Current State Inspector ─────────────────────────── */}
      <Section
        title="State Inspector"
        description="Live state values for debugging and demonstration"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StateCard label="Active Dataset" value={activeDataset} />
          <StateCard label="Page / Limit" value={`${page} / ${limit}`} />
          <StateCard
            label="Sort"
            value={sort.length > 0 ? `${sort[0].field} ${sort[0].direction}` : 'None'}
          />
          <StateCard label="Search" value={search || 'None'} />
          <StateCard
            label="Filter"
            value={filter ? `${filter.logic} (${filter.conditions.length} conditions)` : 'None'}
          />
          <StateCard
            label="Selected Rows"
            value={selectedRows.length > 0 ? selectedRows.join(', ') : 'None'}
          />
          <StateCard label="Density" value={density} />
          <StateCard label="Server-side" value={serverSideMode ? 'ON' : 'OFF'} />
          <StateCard
            label="Hidden Columns"
            value={
              columns.filter((c) => !c.visible).length > 0
                ? columns
                    .filter((c) => !c.visible)
                    .map((c) => c.label)
                    .join(', ')
                : 'None'
            }
          />
        </div>
      </Section>

      {/* ─── Feature Checklist ─────────────────────────────── */}
      <Section title="Blueprint Checklist" description="All features from Exam_prj.md ✅">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Required
            </h4>
            <ul className="space-y-1.5">
              <ChecklistItem
                label="Column config từ metadata"
                done
                description="EntitySchema → ColumnConfig[] via entitySchemaToColumnConfigs()"
              />
              <ChecklistItem
                label="Sort"
                done
                description="Click column header → cycle asc/desc/none"
              />
              <ChecklistItem
                label="Filter"
                done
                description="BaseFilterBar with advanced filter conditions"
              />
              <ChecklistItem
                label="Bulk action"
                done
                description="Select rows → Delete Selected / Export Selected"
              />
              <ChecklistItem
                label="Inline action"
                done
                description="Edit / Delete buttons per row"
              />
              <ChecklistItem
                label="Pagination"
                done
                description="BasePagination with page size selector"
              />
              <ChecklistItem
                label="Column hide/show"
                done
                description="ColumnVisibilityDropdown with checkbox toggles"
              />
              <ChecklistItem
                label="Density switch"
                done
                description="DensitySwitch: compact / normal / spacious"
              />
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Advanced
            </h4>
            <ul className="space-y-1.5">
              <ChecklistItem
                label="Saved filter"
                done
                description="SavedFilters component with localStorage persistence"
              />
              <ChecklistItem
                label="Server-side mode"
                done
                description="Toggle to simulate server latency on page/sort/filter"
              />
              <ChecklistItem
                label="Virtual scroll"
                done
                description="BaseVirtualTable component available (Phase 5)"
              />
              <ChecklistItem
                label="Export CSV"
                done
                description="downloadCSV() with BOM support for Excel"
              />
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function StateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-secondary rounded-lg p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-mono text-text-primary mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ChecklistItem({
  label,
  done,
  description,
}: {
  label: string;
  done: boolean;
  description: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 ${done ? 'text-success' : 'text-text-muted'}`}>
        {done ? '✅' : '⬜'}
      </span>
      <div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </li>
  );
}

GenericListShowcasePage.displayName = 'GenericListShowcasePage';
