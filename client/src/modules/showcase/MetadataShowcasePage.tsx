import React, { useState, useMemo } from 'react';
import { DynamicForm, DynamicTable } from '../../components/dynamic';
import { BaseButton, BaseModal } from '../../components/base';
import {
  UsersSchema,
  OrdersSchema,
  CategoriesSchema,
  ProductsSchema,
  schemaRegistry,
} from '../../config/schema.config';
import type { EntitySchema } from '../../core/metadata/schema.types';
import toast from 'react-hot-toast';

// ============================================================
// MetadataShowcasePage - Demo Metadata Engine (Week 4)
// Shows how EntitySchema drives DynamicTable + DynamicForm
// ============================================================

// Mock data generators
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2026-01-15T10:30:00Z',
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    is_active: true,
    created_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 3,
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'user',
    is_active: true,
    created_at: '2026-02-10T14:20:00Z',
  },
  {
    id: 4,
    username: 'viewer01',
    email: 'viewer@example.com',
    role: 'viewer',
    is_active: false,
    created_at: '2026-02-15T09:45:00Z',
  },
  {
    id: 5,
    username: 'mod_user',
    email: 'mod@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2026-03-01T11:00:00Z',
  },
];

const MOCK_ORDERS = [
  {
    id: 1,
    order_number: 'ORD-001',
    user_id: 2,
    total: 150000,
    status: 'delivered',
    notes: '',
    created_at: '2026-02-20T10:00:00Z',
    users: { id: 2, username: 'john_doe' },
  },
  {
    id: 2,
    order_number: 'ORD-002',
    user_id: 3,
    total: 85000,
    status: 'shipped',
    notes: 'Urgent delivery',
    created_at: '2026-02-25T14:00:00Z',
    users: { id: 3, username: 'jane_smith' },
  },
  {
    id: 3,
    order_number: 'ORD-003',
    user_id: 2,
    total: 320000,
    status: 'processing',
    notes: '',
    created_at: '2026-03-01T09:00:00Z',
    users: { id: 2, username: 'john_doe' },
  },
  {
    id: 4,
    order_number: 'ORD-004',
    user_id: 4,
    total: 45000,
    status: 'pending',
    notes: 'New customer',
    created_at: '2026-03-02T15:30:00Z',
    users: { id: 4, username: 'viewer01' },
  },
];

const MOCK_CATEGORIES = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    parent_id: null,
    is_active: true,
    sort_order: 1,
    description: 'Electronic devices',
    categories: null,
  },
  {
    id: 2,
    name: 'Phones',
    slug: 'phones',
    parent_id: 1,
    is_active: true,
    sort_order: 1,
    description: 'Mobile phones',
    categories: { id: 1, name: 'Electronics' },
  },
  {
    id: 3,
    name: 'Laptops',
    slug: 'laptops',
    parent_id: 1,
    is_active: true,
    sort_order: 2,
    description: 'Laptop computers',
    categories: { id: 1, name: 'Electronics' },
  },
  {
    id: 4,
    name: 'Clothing',
    slug: 'clothing',
    parent_id: null,
    is_active: true,
    sort_order: 2,
    description: 'Apparel',
  },
  {
    id: 5,
    name: 'T-Shirts',
    slug: 't-shirts',
    parent_id: 4,
    is_active: true,
    sort_order: 1,
    description: '',
    categories: { id: 4, name: 'Clothing' },
  },
];

const MOCK_DATA: Record<string, any[]> = {
  users: MOCK_USERS,
  orders: MOCK_ORDERS,
  categories: MOCK_CATEGORIES,
  products: [],
  order_items: [],
};

const MOCK_RELATION_OPTIONS: Record<
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
    category_id: MOCK_CATEGORIES.map((c) => ({ label: c.name, value: c.id })),
  },
};

// Available schemas for demo
const SCHEMAS: { key: string; schema: EntitySchema }[] = [
  { key: 'users', schema: UsersSchema },
  { key: 'orders', schema: OrdersSchema },
  { key: 'categories', schema: CategoriesSchema },
  { key: 'products', schema: ProductsSchema },
];

export function MetadataShowcasePage() {
  const [activeSchema, setActiveSchema] = useState<string>('users');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState<Array<{ field: string; direction: 'asc' | 'desc' }>>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const currentSchema = useMemo(() => schemaRegistry[activeSchema] || UsersSchema, [activeSchema]);

  const data = MOCK_DATA[activeSchema] || [];
  const relationOpts = MOCK_RELATION_OPTIONS[activeSchema] || {};

  const handleCreate = () => {
    setEditingRow(null);
    setFormMode('create');
    setModalOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditingRow(row);
    setFormMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', { mode: formMode, data: formData });
    toast.success(`${formMode === 'create' ? 'Created' : 'Updated'} successfully (demo)`);
    setModalOpen(false);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log('Delete:', row);
    toast.success(`Deleted ID: ${row.id} (demo)`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Metadata Engine Showcase</h1>
        <p className="text-sm text-text-muted mt-1">
          Week 4 – Phase 2: Dynamic UI rendered entirely from EntitySchema metadata
        </p>
      </div>

      {/* Schema Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">Entity:</span>
        {SCHEMAS.map(({ key, schema }) => (
          <BaseButton
            key={key}
            size="sm"
            variant={activeSchema === key ? 'primary' : 'secondary'}
            onClick={() => {
              setActiveSchema(key);
              setPage(1);
              setSort([]);
              setSelectedRows([]);
            }}
          >
            {schema.icon} {schema.label}
          </BaseButton>
        ))}
      </div>

      {/* Schema Info */}
      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text">
              {currentSchema.icon} {currentSchema.label}
            </h2>
            {currentSchema.description && (
              <p className="text-xs text-text-muted mt-0.5">{currentSchema.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{currentSchema.fields.length} fields</span>
            <span>•</span>
            <span>PK: {currentSchema.primaryKey}</span>
            <span>•</span>
            <span>Display: {currentSchema.displayField}</span>
          </div>
        </div>

        {/* Field type summary */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {currentSchema.fields.map((f) => (
            <span
              key={f.name}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bg border border-border"
              title={`${f.name}: ${f.type}${f.relation ? ` → ${f.relation.target}` : ''}`}
            >
              <span className="font-mono text-primary-600">{f.name}</span>
              <span className="text-text-muted">
                {f.type}
                {f.relation && ` → ${f.relation.target}`}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-secondary">
          Showing {data.length} of {data.length} records
        </div>
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <BaseButton
              size="sm"
              variant="danger"
              onClick={() => {
                toast.success(`Bulk delete ${selectedRows.length} items (demo)`);
                setSelectedRows([]);
              }}
            >
              Delete ({selectedRows.length})
            </BaseButton>
          )}
          <BaseButton size="sm" onClick={handleCreate}>
            + Create {currentSchema.label.replace(/s$/, '')}
          </BaseButton>
        </div>
      </div>

      {/* DynamicTable */}
      <DynamicTable
        schema={currentSchema}
        data={data}
        total={data.length}
        page={page}
        limit={limit}
        sort={sort}
        selectedRows={selectedRows}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSort={setSort}
        onRowSelect={setSelectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        striped
      />

      {/* Create / Edit Modal */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          formMode === 'create'
            ? `Create ${currentSchema.label.replace(/s$/, '')}`
            : `Edit ${currentSchema.label.replace(/s$/, '')}`
        }
        size="lg"
      >
        <DynamicForm
          schema={currentSchema}
          mode={formMode}
          defaultValues={editingRow || {}}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          layout="grid"
          relationOptions={relationOpts}
        />
      </BaseModal>

      {/* Schema JSON Preview */}
      <details className="border border-border rounded-lg">
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-text-secondary hover:bg-bg-secondary">
          View EntitySchema JSON
        </summary>
        <pre className="p-4 text-xs font-mono overflow-auto max-h-96 bg-bg-secondary text-text-muted">
          {JSON.stringify(currentSchema, null, 2)}
        </pre>
      </details>
    </div>
  );
}
