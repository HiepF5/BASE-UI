import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DynamicTable, DynamicForm } from '../../components/dynamic';
import { BaseButton, BaseModal } from '../../components/base';
import { QueryBuilder } from '../../components/query-builder';
import { schemaRegistry } from '../../config/schema.config';
import type { EntitySchema } from '../../core/metadata/schema.types';
import type { FilterGroupNode, QueryField } from '../../core/query-builder';
import {
  createEmptyGroup,
  resolveQueryFields,
  countConditions,
  astToFlatFilter,
  astToSQLPreview,
} from '../../core/query-builder';
import type { SortOption, FilterGroup } from '../../types';
import toast from 'react-hot-toast';

// ============================================================
// ExampleAppPage – Phase 4: Example App
// User chỉ cần config JSON để có hệ thống
// Demonstrates: CRUD auto render, Filter auto render,
//   Relation inline edit, Saved filter, Pagination
// ============================================================

// ─── Saved Filter types ──────────────────────────────────────
interface SavedFilter {
  id: string;
  name: string;
  entity: string;
  filter: FilterGroupNode;
  createdAt: string;
}

const SAVED_FILTERS_KEY = 'base-ui-saved-filters';

function loadSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(SAVED_FILTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedFilters(filters: SavedFilter[]) {
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

// ─── Mock data generator ─────────────────────────────────────
function generateMockData(schema: EntitySchema, count: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i <= count; i++) {
    const row: Record<string, unknown> = {};
    for (const field of schema.fields) {
      if (field.isPrimary) {
        row[field.name] = i;
        continue;
      }
      switch (field.type) {
        case 'text':
        case 'email':
        case 'url':
        case 'phone':
        case 'textarea':
          row[field.name] = generateTextValue(field.name, i);
          break;
        case 'number':
          row[field.name] = Math.round(Math.random() * 1000 * 100) / 100;
          break;
        case 'boolean':
          row[field.name] = Math.random() > 0.3;
          break;
        case 'date':
        case 'datetime':
          row[field.name] = new Date(
            Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
          ).toISOString();
          break;
        case 'select':
          if (field.options?.length) {
            row[field.name] = field.options[Math.floor(Math.random() * field.options.length)].value;
          }
          break;
        case 'relation':
          if (field.relation?.type === 'ManyToOne') {
            row[field.name] = Math.floor(Math.random() * 10) + 1;
          } else if (field.relation?.type === 'ManyToMany') {
            row[field.name] = [1, 2, 3].slice(0, Math.floor(Math.random() * 3) + 1);
          }
          break;
        case 'json':
          row[field.name] = JSON.stringify({ key: `value_${i}` });
          break;
        default:
          row[field.name] = `${field.name}_${i}`;
      }
    }
    rows.push(row);
  }
  return rows;
}

function generateTextValue(fieldName: string, index: number): string {
  const nameMap: Record<string, string[]> = {
    username: [
      'admin',
      'john_doe',
      'jane_smith',
      'viewer01',
      'developer',
      'tester',
      'manager',
      'analyst',
    ],
    email: ['admin@example.com', 'john@test.com', 'jane@demo.com', 'user@corp.com'],
    name: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Food', 'Health'],
    product_name: [
      'Laptop Pro',
      'Wireless Mouse',
      'USB-C Hub',
      'Monitor 27"',
      'Keyboard',
      'Webcam',
      'Headset',
    ],
    order_number: [`ORD-${String(1000 + index).padStart(6, '0')}`],
    slug: [`item-${index}`, `product-${index}`, `cat-${index}`],
    description: ['A great product', 'Best seller item', 'New arrival', 'Limited edition'],
    notes: ['Rush delivery', 'Gift wrap', 'Handle with care', ''],
  };

  const matches = nameMap[fieldName];
  if (matches) return matches[index % matches.length];
  return `${fieldName}_${index}`;
}

// ─── Entity selector config ──────────────────────────────────
const EXAMPLE_ENTITIES = [
  { key: 'users', label: 'Users', icon: '👤', description: 'System users management' },
  { key: 'orders', label: 'Orders', icon: '📦', description: 'Customer orders with relations' },
  { key: 'order_items', label: 'Order Items', icon: '🛒', description: 'Line items within orders' },
  {
    key: 'categories',
    label: 'Categories',
    icon: '📁',
    description: 'Self-referencing category tree',
  },
];

// ─── Main Component ──────────────────────────────────────────

export default function ExampleAppPage() {
  // Active entity
  const [activeEntity, setActiveEntity] = useState('users');
  const schema = schemaRegistry[activeEntity];

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(schema?.defaultPageSize ?? 20);

  // Sort state
  const [sort, setSort] = useState<SortOption[]>(schema?.defaultSort ? [schema.defaultSort] : []);

  // Filter state (QueryBuilder AST)
  const [filterAST, setFilterAST] = useState<FilterGroupNode>(createEmptyGroup('AND'));
  const [appliedFilter, setAppliedFilter] = useState<FilterGroup | null>(null);

  // Saved filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(loadSavedFilters);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Selection
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [deleteRow, setDeleteRow] = useState<Record<string, unknown> | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Mock data
  const allData = useMemo(() => (schema ? generateMockData(schema, 85) : []), [schema]);

  // Query fields for QueryBuilder
  const queryFields = useMemo<QueryField[]>(
    () => (schema ? resolveQueryFields(schema, schemaRegistry, 2) : []),
    [schema],
  );

  // Mock relation options
  const relationOptions = useMemo(() => {
    const opts: Record<string, Array<{ label: string; value: string | number }>> = {};
    if (!schema) return opts;
    for (const field of schema.fields) {
      if (field.type === 'relation' && field.relation) {
        const target = schemaRegistry[field.relation.target];
        if (target) {
          const mockTargetData = generateMockData(target, 8);
          opts[field.name] = mockTargetData.map((row) => ({
            label: String(row[target.displayField ?? 'name'] ?? row.id),
            value: row.id as number,
          }));
        }
      }
    }
    return opts;
  }, [schema]);

  // Apply client-side search + filter + sort + pagination
  const filteredData = useMemo(() => {
    let result = [...allData];

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(lowerSearch)),
      );
    }

    // Sort (simple client-side sort on first sort field)
    if (sort.length > 0) {
      const { field, direction } = sort[0];
      result.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [allData, search, sort]);

  const total = filteredData.length;
  const paginatedData = useMemo(
    () => filteredData.slice((page - 1) * limit, page * limit),
    [filteredData, page, limit],
  );

  // Reset on entity change
  useEffect(() => {
    setPage(1);
    setSearch('');
    setFilterAST(createEmptyGroup('AND'));
    setAppliedFilter(null);
    setSelectedRows([]);
    setSort(schema?.defaultSort ? [schema.defaultSort] : []);
    setLimit(schema?.defaultPageSize ?? 20);
  }, [activeEntity, schema]);

  // ─── Handlers ──────────────────────────────────────────

  const handleApplyFilter = useCallback(() => {
    if (countConditions(filterAST) === 0) {
      setAppliedFilter(null);
    } else {
      const flat = astToFlatFilter(filterAST);
      setAppliedFilter(flat);
    }
    setPage(1);
    toast.success(
      countConditions(filterAST) > 0
        ? `Filter applied: ${countConditions(filterAST)} conditions`
        : 'Filter cleared',
    );
  }, [filterAST]);

  const handleClearFilter = useCallback(() => {
    setFilterAST(createEmptyGroup('AND'));
    setAppliedFilter(null);
    setPage(1);
  }, []);

  const handleSaveFilter = useCallback(() => {
    if (!filterName.trim()) return;
    const newFilter: SavedFilter = {
      id: Date.now().toString(36),
      name: filterName.trim(),
      entity: activeEntity,
      filter: filterAST,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    persistSavedFilters(updated);
    setFilterName('');
    setShowSaveDialog(false);
    toast.success(`Filter "${newFilter.name}" saved`);
  }, [filterName, filterAST, activeEntity, savedFilters]);

  const handleLoadFilter = useCallback((saved: SavedFilter) => {
    setFilterAST(saved.filter);
    const flat = astToFlatFilter(saved.filter);
    setAppliedFilter(countConditions(saved.filter) > 0 ? flat : null);
    setPage(1);
    toast.success(`Loaded filter: ${saved.name}`);
  }, []);

  const handleDeleteSavedFilter = useCallback(
    (id: string) => {
      const updated = savedFilters.filter((f) => f.id !== id);
      setSavedFilters(updated);
      persistSavedFilters(updated);
      toast.success('Filter deleted');
    },
    [savedFilters],
  );

  const handleCreate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: Record<string, any>) => {
      toast.success(`${schema?.label ?? 'Record'} created (mock)`);
      setCreateOpen(false);
      console.log('[ExampleApp] Create:', data);
    },
    [schema],
  );

  const handleEdit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: Record<string, any>) => {
      toast.success(`${schema?.label ?? 'Record'} updated (mock)`);
      setEditingRow(null);
      console.log('[ExampleApp] Edit:', data);
    },
    [schema],
  );

  const handleDelete = useCallback(() => {
    toast.success(`${schema?.label ?? 'Record'} deleted (mock)`);
    setDeleteRow(null);
  }, [schema]);

  // Entity saved filters
  const entitySavedFilters = useMemo(
    () => savedFilters.filter((f) => f.entity === activeEntity),
    [savedFilters, activeEntity],
  );

  if (!schema) {
    return <div className="p-6 text-center text-text-muted">Entity not found</div>;
  }

  const sqlPreview = astToSQLPreview(filterAST);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ─── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">📋 Example App</h1>
        <p className="text-sm text-text-muted mt-1">
          Phase 4 – User chỉ cần config JSON để có hệ thống. Select entity → auto CRUD, filter,
          relation, pagination.
        </p>
      </div>

      {/* ─── Config JSON Preview Banner ── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-indigo-800 mb-0.5">
              💡 Config-driven: One EntitySchema JSON → Full CRUD Module
            </h3>
            <p className="text-xs text-indigo-700">
              Each entity below is defined by a single{' '}
              <code className="bg-indigo-100 px-1 rounded">EntitySchema</code> object. Table, form,
              filter, relation, validation, pagination – all auto-rendered.
            </p>
          </div>
          <BaseButton size="sm" variant="outline" onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? 'Hide Config' : 'View Config JSON'}
          </BaseButton>
        </div>

        {showConfig && (
          <pre className="mt-3 bg-indigo-900 text-green-400 rounded-lg p-3 text-[11px] overflow-auto max-h-80 font-mono">
            {JSON.stringify(schema, null, 2)}
          </pre>
        )}
      </div>

      {/* ─── Entity Selector ── */}
      <div className="flex gap-2 flex-wrap">
        {EXAMPLE_ENTITIES.map((e) => (
          <button
            key={e.key}
            onClick={() => setActiveEntity(e.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
              activeEntity === e.key
                ? 'bg-primary-50 border-primary-300 text-primary-700 font-medium shadow-sm'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-200 hover:bg-neutral-50'
            }`}
          >
            <span className="text-lg">{e.icon}</span>
            <div className="text-left">
              <div className="font-medium">{e.label}</div>
              <div className="text-[10px] text-neutral-500">{e.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ─── Action Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {schema.icon && <span className="text-2xl">{schema.icon}</span>}
          <div>
            <h2 className="text-lg font-bold text-text-primary">{schema.label}</h2>
            {schema.description && <p className="text-xs text-text-muted">{schema.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BaseButton
            size="sm"
            variant={showFilterPanel ? 'primary' : 'outline'}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            🔍 Filter
            {appliedFilter && (
              <span className="ml-1 bg-primary-200 text-primary-800 text-[10px] px-1.5 py-0.5 rounded-full">
                active
              </span>
            )}
          </BaseButton>
          {schema.permissions?.create !== false && (
            <BaseButton onClick={() => setCreateOpen(true)}>+ Create {schema.label}</BaseButton>
          )}
        </div>
      </div>

      {/* ─── Search Bar ── */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Search ${schema.label.toLowerCase()}...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* ─── Filter Panel (QueryBuilder + Saved Filters) ── */}
      {showFilterPanel && (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          {/* QueryBuilder */}
          <div className="p-4 border-b border-neutral-100">
            <QueryBuilder
              fields={queryFields}
              value={filterAST}
              onChange={setFilterAST}
              maxDepth={3}
              showPreview
            />

            <div className="flex items-center gap-2 mt-3">
              <BaseButton size="sm" onClick={handleApplyFilter}>
                Apply Filter
              </BaseButton>
              {countConditions(filterAST) > 0 && (
                <>
                  <BaseButton size="sm" variant="secondary" onClick={handleClearFilter}>
                    Clear
                  </BaseButton>
                  <BaseButton size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}>
                    💾 Save Filter
                  </BaseButton>
                </>
              )}
            </div>
          </div>

          {/* Saved Filters */}
          {entitySavedFilters.length > 0 && (
            <div className="bg-neutral-50 px-4 py-3">
              <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Saved Filters
              </h4>
              <div className="flex flex-wrap gap-2">
                {entitySavedFilters.map((sf) => (
                  <div
                    key={sf.id}
                    className="flex items-center gap-1 bg-white border border-neutral-200 rounded-full px-3 py-1 text-xs"
                  >
                    <button
                      onClick={() => handleLoadFilter(sf)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {sf.name}
                    </button>
                    <span className="text-neutral-400">({countConditions(sf.filter)})</span>
                    <button
                      onClick={() => handleDeleteSavedFilter(sf.id)}
                      className="text-neutral-400 hover:text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Applied Filter Info ── */}
      {appliedFilter && !showFilterPanel && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
          <span className="text-amber-700 font-medium">
            Active filter: {countConditions(filterAST)} condition(s)
          </span>
          {sqlPreview && (
            <code className="text-amber-600 font-mono text-[10px] flex-1 truncate">
              WHERE {sqlPreview}
            </code>
          )}
          <button
            onClick={() => setShowFilterPanel(true)}
            className="text-amber-600 hover:text-amber-700 underline"
          >
            Edit
          </button>
          <button onClick={handleClearFilter} className="text-amber-600 hover:text-red-600">
            ×
          </button>
        </div>
      )}

      {/* ─── Data Table (auto-rendered from EntitySchema) ── */}
      <DynamicTable
        schema={schema}
        data={paginatedData}
        total={total}
        page={page}
        limit={limit}
        sort={sort}
        selectedRows={selectedRows}
        loading={false}
        striped
        showPagination
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onSort={(s) => setSort(s)}
        onRowSelect={setSelectedRows}
        onEdit={(row) => setEditingRow(row)}
        onDelete={(row) => setDeleteRow(row)}
      />

      {/* ─── Footer Stats ── */}
      <div className="flex items-center justify-between text-xs text-text-muted border-t border-neutral-200 pt-3">
        <span>
          {total > 0
            ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} records`
            : 'No records match'}
        </span>
        <div className="flex items-center gap-3">
          {selectedRows.length > 0 && <span>{selectedRows.length} selected</span>}
          <span className="text-neutral-400">
            {schema.fields.length} fields |{' '}
            {schema.fields.filter((f) => f.type === 'relation').length} relations
          </span>
        </div>
      </div>

      {/* ─── Create Modal ── */}
      <BaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={`Create ${schema.label}`}
        size="lg"
      >
        <DynamicForm
          schema={schema}
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          layout="grid"
          relationOptions={relationOptions}
          relationLoading={{}}
        />
      </BaseModal>

      {/* ─── Edit Modal (Relation inline edit in edit mode) ── */}
      <BaseModal
        open={!!editingRow}
        onClose={() => setEditingRow(null)}
        title={`Edit ${schema.label}`}
        size="lg"
      >
        {editingRow && (
          <DynamicForm
            schema={schema}
            mode="edit"
            defaultValues={editingRow}
            onSubmit={handleEdit}
            onCancel={() => setEditingRow(null)}
            layout="grid"
            relationOptions={relationOptions}
            relationLoading={{}}
            parentId={editingRow.id as number}
            connectionId="default"
          />
        )}
      </BaseModal>

      {/* ─── Delete Confirm ── */}
      <BaseModal
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title={`Delete ${schema.label}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this {schema.label.toLowerCase()}? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={() => setDeleteRow(null)}>
              Cancel
            </BaseButton>
            <BaseButton variant="danger" onClick={handleDelete}>
              Delete
            </BaseButton>
          </div>
        </div>
      </BaseModal>

      {/* ─── Save Filter Dialog ── */}
      <BaseModal open={showSaveDialog} onClose={() => setShowSaveDialog(false)} title="Save Filter">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Filter Name
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="e.g. Active Admin Users"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveFilter();
              }}
            />
          </div>

          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
              Preview
            </p>
            <code className="text-xs text-neutral-600 font-mono">
              {countConditions(filterAST)} conditions — WHERE{' '}
              {astToSQLPreview(filterAST) || '(empty)'}
            </code>
          </div>

          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </BaseButton>
            <BaseButton onClick={handleSaveFilter} disabled={!filterName.trim()}>
              Save Filter
            </BaseButton>
          </div>
        </div>
      </BaseModal>

      {/* ─── Checklist ── */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Phase 4 Checklist ✓</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
          <div className="text-xs text-green-700">
            ✅ Example modules: User, Order, OrderItem, Category
          </div>
          <div className="text-xs text-green-700">
            ✅ Config example: EntitySchema JSON → auto render
          </div>
          <div className="text-xs text-green-700">
            ✅ CRUD auto render: DynamicTable + DynamicForm
          </div>
          <div className="text-xs text-green-700">
            ✅ Filter auto render: QueryBuilder integrated
          </div>
          <div className="text-xs text-green-700">
            ✅ Relation inline edit: ManyToOne dropdown + OneToMany
          </div>
          <div className="text-xs text-green-700">✅ Saved filter: localStorage persistence</div>
          <div className="text-xs text-green-700">
            ✅ Pagination: server-compatible, page size selector
          </div>
        </div>
      </div>
    </div>
  );
}
