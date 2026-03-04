import React, { useState, useMemo } from 'react';
import { QueryBuilder } from '../../components/query-builder';
import { schemaRegistry } from '../../config/schema.config';
import {
  createEmptyGroup,
  resolveQueryFields,
  astToFlatFilter,
  astToSQLPreview,
  countConditions,
  getMaxDepth,
  validateAST,
  type FilterGroupNode,
  type QueryField,
} from '../../core/query-builder';

// ============================================================
// QueryBuilderShowcasePage – Phase 3 Query Builder Demo
// Showcases: AST format, ConditionRow, ConditionGroup,
//            Nested AND/OR, Relation field support, SQL Preview
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

// ─── 1. Basic Query Builder Demo ─────────────────────────────

function BasicQueryBuilderDemo() {
  const schema = schemaRegistry.users;
  const fields = useMemo(() => resolveQueryFields(schema, schemaRegistry, 1), [schema]);

  const [filter, setFilter] = useState<FilterGroupNode>(createEmptyGroup('AND'));

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        <strong>Users</strong> entity – direct fields only (username, email, role, active,
        created_at). Each field type has smart operators: text fields → Contains/Starts With, number
        → Greater/Less, date → Before/After, etc.
      </p>

      <QueryBuilder fields={fields} value={filter} onChange={setFilter} maxDepth={3} showPreview />

      <details className="text-xs">
        <summary className="cursor-pointer text-text-muted font-medium">
          View AST JSON ({countConditions(filter)} conditions, depth {getMaxDepth(filter)})
        </summary>
        <pre className="mt-2 bg-neutral-900 text-green-400 p-3 rounded-lg overflow-auto max-h-60 text-[11px]">
          {JSON.stringify(filter, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ─── 2. Relation Fields Demo ─────────────────────────────────

function RelationFieldsDemo() {
  const schema = schemaRegistry.orders;
  const fields = useMemo(() => resolveQueryFields(schema, schemaRegistry, 2), [schema]);

  const [filter, setFilter] = useState<FilterGroupNode>({
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'condition', field: 'order_number', operator: 'contains', value: 'ORD' },
      {
        type: 'group',
        operator: 'OR',
        children: [
          { type: 'condition', field: 'users.username', operator: 'contains', value: 'admin' },
          { type: 'condition', field: 'total', operator: 'gte', value: 100 },
        ],
      },
    ],
  });

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        <strong>Orders</strong> entity – includes relation dot-path fields (Customer → Username,
        Customer → Email). Relation fields are resolved from schema registry up to depth 2.
      </p>

      <div className="text-xs mb-2">
        <span className="font-medium text-text-secondary">Available fields: </span>
        {fields.map((f) => (
          <span
            key={f.name}
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-1 mb-1 ${
              f.isRelationPath ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {f.name}
          </span>
        ))}
      </div>

      <QueryBuilder fields={fields} value={filter} onChange={setFilter} maxDepth={3} showPreview />
    </div>
  );
}

// ─── 3. Nested AND/OR Demo ───────────────────────────────────

function NestedAndOrDemo() {
  const fields = useMemo<QueryField[]>(
    () => [
      { name: 'name', label: 'Product Name', type: 'text' },
      { name: 'price', label: 'Price', type: 'number' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Books', value: 'books' },
          { label: 'Home', value: 'home' },
        ],
      },
      { name: 'in_stock', label: 'In Stock', type: 'boolean' },
      { name: 'created_at', label: 'Created Date', type: 'date' },
    ],
    [],
  );

  const [filter, setFilter] = useState<FilterGroupNode>({
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'condition', field: 'in_stock', operator: 'eq', value: true },
      {
        type: 'group',
        operator: 'OR',
        children: [
          {
            type: 'group',
            operator: 'AND',
            children: [
              { type: 'condition', field: 'category', operator: 'eq', value: 'electronics' },
              { type: 'condition', field: 'price', operator: 'lte', value: 500 },
            ],
          },
          {
            type: 'group',
            operator: 'AND',
            children: [
              { type: 'condition', field: 'category', operator: 'eq', value: 'books' },
              { type: 'condition', field: 'price', operator: 'lte', value: 50 },
            ],
          },
        ],
      },
    ],
  });

  const validation = useMemo(() => validateAST(filter, fields), [filter, fields]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Complex nested filter:{' '}
        <code className="bg-neutral-100 px-1 rounded">
          in_stock = true AND ((category = electronics AND price ≤ 500) OR (category = books AND
          price ≤ 50))
        </code>
        . Max depth is 3. Click AND/OR badges to toggle. Groups are color-coded by depth.
      </p>

      <QueryBuilder fields={fields} value={filter} onChange={setFilter} maxDepth={3} showPreview />

      {/* Validation Status */}
      <div
        className={`text-xs px-3 py-2 rounded-lg ${validation.valid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
      >
        {validation.valid
          ? `✓ Valid filter: ${countConditions(filter)} conditions, max depth ${getMaxDepth(filter)}`
          : `⚠ ${validation.errors.length} issue(s): ${validation.errors.join('; ')}`}
      </div>
    </div>
  );
}

// ─── 4. AST ↔ Flat Format Converter Demo ─────────────────────

function ASTConverterDemo() {
  const fields: QueryField[] = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ];

  const [filter, setFilter] = useState<FilterGroupNode>({
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'condition', field: 'username', operator: 'contains', value: 'john' },
      { type: 'condition', field: 'role', operator: 'eq', value: 'admin' },
    ],
  });

  const flatFilter = useMemo(() => astToFlatFilter(filter), [filter]);
  const sqlPreview = useMemo(() => astToSQLPreview(filter), [filter]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Shows the typed AST format (aligned with server) and the converted flat format
        (backward-compatible with BaseFilterBar). Also shows SQL preview.
      </p>

      <QueryBuilder fields={fields} value={filter} onChange={setFilter} compact />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* AST JSON */}
        <div>
          <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Typed AST (Server Format)
          </h4>
          <pre className="bg-neutral-900 text-green-400 p-2 rounded text-[10px] overflow-auto max-h-48">
            {JSON.stringify(filter, null, 2)}
          </pre>
        </div>

        {/* Flat Format */}
        <div>
          <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Flat Format (Legacy)
          </h4>
          <pre className="bg-neutral-900 text-blue-400 p-2 rounded text-[10px] overflow-auto max-h-48">
            {JSON.stringify(flatFilter, null, 2)}
          </pre>
        </div>

        {/* SQL Preview */}
        <div>
          <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            SQL Preview
          </h4>
          <pre className="bg-neutral-900 text-amber-400 p-2 rounded text-[10px] overflow-auto max-h-48">
            WHERE {sqlPreview}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Disabled / Compact Variants ──────────────────────────

function VariantsDemo() {
  const fields: QueryField[] = [
    { name: 'name', label: 'Name', type: 'text' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ];

  const sampleFilter: FilterGroupNode = {
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'condition', field: 'name', operator: 'contains', value: 'test' },
      { type: 'condition', field: 'status', operator: 'eq', value: 'active' },
    ],
  };

  const [compactFilter, setCompactFilter] = useState<FilterGroupNode>(sampleFilter);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Variants: disabled (read-only) and compact (reduced padding).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-neutral-600 mb-2">Disabled (read-only)</h4>
          <QueryBuilder fields={fields} value={sampleFilter} onChange={() => {}} disabled />
        </div>

        <div>
          <h4 className="text-xs font-medium text-neutral-600 mb-2">Compact</h4>
          <QueryBuilder fields={fields} value={compactFilter} onChange={setCompactFilter} compact />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function QueryBuilderShowcasePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">🔍 Query Builder Showcase</h1>
        <p className="text-sm text-text-muted mt-1">
          Phase 3 – Query Builder: Typed AST, metadata-driven operators, nested AND/OR groups,
          relation field support, SQL preview, and backward-compatible format conversion.
        </p>
      </div>

      {/* Architecture Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">Architecture</h3>
        <p className="text-xs text-blue-700">
          UI → Filter AST (typed JSON) → Query Engine (NestJS) → ORM Adapter → Database. Frontend
          AST format is aligned with server{' '}
          <code className="bg-blue-100 px-1 rounded">filter.types.ts</code>:
          <code className="bg-blue-100 px-1 rounded ml-1">
            FilterNode = FilterGroupNode | FilterConditionNode
          </code>
          with <code className="bg-blue-100 px-1 rounded">type</code> discriminator.
        </p>
      </div>

      {/* Sections */}
      <Section
        title="1. Basic Query Builder"
        description="Metadata-driven operators per field type. From EntitySchema → QueryField[] → type-aware ConditionRow."
      >
        <BasicQueryBuilderDemo />
      </Section>

      <Section
        title="2. Relation Field Support"
        description="Dot-path field resolution from schema registry. Orders → user.username, user.email (depth 2 max)."
      >
        <RelationFieldsDemo />
      </Section>

      <Section
        title="3. Nested AND/OR Groups"
        description="Recursive ConditionGroup with depth-coded colors. Max depth configurable. Validation built-in."
      >
        <NestedAndOrDemo />
      </Section>

      <Section
        title="4. AST Format & Converters"
        description="Typed AST (server-aligned) ↔ Flat format (backward-compat). Plus SQL preview generation."
      >
        <ASTConverterDemo />
      </Section>

      <Section
        title="5. Variants: Disabled & Compact"
        description="Read-only (disabled) and compact layout modes."
      >
        <VariantsDemo />
      </Section>

      {/* Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Checklist ✓</h3>
        <ul className="text-xs text-green-700 space-y-0.5">
          <li>✅ AST format – Typed FilterNode with type discriminator (aligned with server)</li>
          <li>
            ✅ ConditionRow – Metadata-driven operators per field type, type-aware value inputs
          </li>
          <li>✅ ConditionGroup – Recursive rendering, depth-coded colors, add/remove</li>
          <li>✅ Nested AND/OR – Toggle AND↔OR, max depth configurable, validation</li>
          <li>✅ Relation field support – resolveQueryFields from EntitySchema with dot-paths</li>
          <li>
            ✅ Backend parser adapter – Server has FilterParser + OrmAdapter (toSQL, toPrisma) +
            RelationParser
          </li>
        </ul>
      </div>
    </div>
  );
}
