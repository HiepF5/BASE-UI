import React, { useMemo } from 'react';
import { BaseTable, type CellRenderer } from '../base/BaseTable';
import type { EntitySchema } from '../../core/metadata/schema.types';
import { entitySchemaToColumnConfigs } from '../../core/metadata';
import { resolveRelationDisplayValue } from '../../core/metadata/relation-mapping';
import type { SortOption } from '../../types';

// ============================================================
// DynamicTable - Metadata-driven table component
// Renders table từ EntitySchema với relation display, custom cells
// Wraps BaseTable + adds metadata-aware cell renderers
// ============================================================

export interface DynamicTableProps {
  /** Entity schema (full metadata) */
  schema: EntitySchema;
  /** Table data */
  data: Record<string, unknown>[];
  /** Total records (for pagination) */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  limit: number;
  /** Current sort */
  sort?: SortOption[];
  /** Selected row IDs */
  selectedRows?: string[];
  /** Loading state */
  loading?: boolean;
  /** Additional custom cell renderers (merged with auto-generated) */
  cellRenderers?: Record<string, CellRenderer>;
  /** Stripe rows */
  striped?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Custom empty state */
  emptyContent?: React.ReactNode;
  /** Custom class */
  className?: string;
  // ─── Event handlers ─────
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort?: (sort: SortOption[]) => void;
  onRowSelect?: (ids: string[]) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
}

export function DynamicTable({
  schema,
  data,
  total,
  page,
  limit,
  sort = [],
  selectedRows = [],
  loading,
  cellRenderers: customCellRenderers,
  striped = true,
  compact = false,
  showPagination = true,
  emptyContent,
  className,
  onPageChange,
  onLimitChange,
  onSort,
  onRowSelect,
  onRowClick,
  onEdit,
  onDelete,
}: DynamicTableProps) {
  // ─── Convert EntitySchema → ColumnConfig[] for BaseTable ──
  const columns = useMemo(() => entitySchemaToColumnConfigs(schema), [schema]);

  // ─── Build metadata-aware cell renderers ──────────────────
  const cellRenderers = useMemo(() => {
    const renderers: Record<string, CellRenderer> = {};

    for (const field of schema.fields) {
      // Custom renderer from props takes priority
      if (customCellRenderers?.[field.name]) {
        renderers[field.name] = customCellRenderers[field.name];
        continue;
      }

      // Custom renderer registered in field config
      if (field.cellRenderer) {
        // Lookup from customCellRenderers by name
        if (customCellRenderers?.[field.cellRenderer]) {
          renderers[field.name] = customCellRenderers[field.cellRenderer];
        }
        continue;
      }

      // ─── Auto-generated renderers per type ──────────────
      switch (field.type) {
        case 'relation':
          renderers[field.name] = (value: unknown, row: Record<string, unknown>) => {
            const display = resolveRelationDisplayValue(row, field);
            return (
              <span className="text-primary-600 font-medium" title={String(value)}>
                {display}
              </span>
            );
          };
          break;

        case 'boolean':
          renderers[field.name] = (value: unknown) => (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                value ? 'bg-success/10 text-success' : 'bg-neutral-100 text-text-muted'
              }`}
            >
              {value ? '✓ Yes' : '✗ No'}
            </span>
          );
          break;

        case 'email':
          renderers[field.name] = (value: unknown) =>
            value ? (
              <a
                href={`mailto:${String(value)}`}
                className="text-primary-600 hover:text-primary-700 underline"
                onClick={(e) => e.stopPropagation()}
              >
                {String(value)}
              </a>
            ) : (
              <span className="text-text-muted">—</span>
            );
          break;

        case 'url':
          renderers[field.name] = (value: unknown) =>
            value ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
                onClick={(e) => e.stopPropagation()}
              >
                {String(value)
                  .replace(/^https?:\/\//, '')
                  .slice(0, 40)}
              </a>
            ) : (
              <span className="text-text-muted">—</span>
            );
          break;

        case 'select': {
          const options = field.options;
          if (options?.length) {
            renderers[field.name] = (value: unknown) => {
              const opt = options.find((o) => String(o.value) === String(value));
              return (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-bg-secondary text-text-secondary border border-border">
                  {opt?.label || String(value)}
                </span>
              );
            };
          }
          break;
        }

        case 'json':
          renderers[field.name] = (value: unknown) => {
            if (!value) return <span className="text-text-muted">—</span>;
            const str = typeof value === 'string' ? value : JSON.stringify(value);
            return (
              <code className="text-xs font-mono bg-bg-secondary px-1.5 py-0.5 rounded max-w-[200px] truncate block">
                {str.length > 50 ? str.slice(0, 50) + '...' : str}
              </code>
            );
          };
          break;

        case 'password':
          renderers[field.name] = () => <span className="text-text-muted">••••••••</span>;
          break;

        case 'date':
        case 'datetime':
          renderers[field.name] = (value: unknown) => {
            if (!value) return <span className="text-text-muted">—</span>;
            try {
              const date = new Date(String(value));
              return field.type === 'datetime'
                ? date.toLocaleString('vi-VN')
                : date.toLocaleDateString('vi-VN');
            } catch {
              return String(value);
            }
          };
          break;

        // number, text, textarea, phone – use BaseTable default renderCell
      }

      // Apply cellClassName if specified
      if (field.cellClassName && renderers[field.name]) {
        const originalRenderer = renderers[field.name];
        renderers[field.name] = (value, row, col) => (
          <span className={field.cellClassName}>{originalRenderer(value, row, col)}</span>
        );
      }
    }

    return renderers;
  }, [schema, customCellRenderers]);

  return (
    <BaseTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      limit={limit}
      sort={sort}
      selectedRows={selectedRows}
      loading={loading}
      primaryKey={schema.primaryKey || 'id'}
      striped={striped}
      compact={compact}
      showPagination={showPagination}
      cellRenderers={cellRenderers}
      emptyContent={emptyContent}
      className={className}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      onSort={onSort}
      onRowSelect={onRowSelect}
      onRowClick={onRowClick}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

DynamicTable.displayName = 'DynamicTable';
