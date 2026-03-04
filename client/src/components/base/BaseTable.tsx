import React from 'react';
import { cn } from '../../core/utils';
import { BaseButton } from './BaseButton';
import { BasePagination } from './BasePagination';
import type { ColumnConfig, SortOption } from '../../types';

// ============================================================
// BaseTable - Headless-style table with sort, select, pagination
// Composable: uses BasePagination, pure presentational
// ============================================================

/** Custom cell renderer */
export type CellRenderer = (value: any, row: any, col: ColumnConfig) => React.ReactNode;

export interface BaseTableProps {
  columns: ColumnConfig[];
  data: any[];
  total: number;
  page: number;
  limit: number;
  sort?: SortOption[];
  selectedRows?: string[];
  loading?: boolean;
  primaryKey?: string;
  /** Stripe rows */
  striped?: boolean;
  /** Compact row spacing */
  compact?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Custom cell renderers by column name */
  cellRenderers?: Record<string, CellRenderer>;
  /** Empty state content */
  emptyContent?: React.ReactNode;
  className?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort?: (sort: SortOption[]) => void;
  onRowSelect?: (ids: string[]) => void;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export function BaseTable({
  columns,
  data,
  total,
  page,
  limit,
  sort = [],
  selectedRows = [],
  loading,
  primaryKey = 'id',
  striped = false,
  compact = false,
  showPagination = true,
  cellRenderers,
  emptyContent,
  className,
  onPageChange,
  onLimitChange,
  onSort,
  onRowSelect,
  onRowClick,
  onEdit,
  onDelete,
}: BaseTableProps) {
  const visibleColumns = columns.filter((col) => col.visible);

  const handleSort = (columnName: string) => {
    if (!onSort) return;
    const existing = sort.find((s) => s.field === columnName);
    if (!existing) {
      onSort([{ field: columnName, direction: 'asc' }]);
    } else if (existing.direction === 'asc') {
      onSort([{ field: columnName, direction: 'desc' }]);
    } else {
      onSort([]);
    }
  };

  const handleSelectAll = () => {
    if (!onRowSelect) return;
    if (selectedRows.length === data.length) {
      onRowSelect([]);
    } else {
      onRowSelect(data.map((row) => row[primaryKey]));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onRowSelect) return;
    if (selectedRows.includes(id)) {
      onRowSelect(selectedRows.filter((r) => r !== id));
    } else {
      onRowSelect([...selectedRows, id]);
    }
  };

  const getSortIcon = (field: string) => {
    const s = sort.find((s) => s.field === field);
    if (!s) return '↕';
    return s.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-bg-tertiary border-b border-border">
            <tr>
              {onRowSelect && (
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.name}
                  className={cn(
                    compact ? 'px-3 py-2' : 'p-3',
                    'text-left font-medium text-text-secondary',
                    col.sortable && 'cursor-pointer hover:text-text select-none',
                  )}
                  style={{ width: col.width ? `${col.width}px` : undefined }}
                  onClick={() => col.sortable && handleSort(col.name)}
                  aria-sort={
                    sort.find((s) => s.field === col.name)?.direction === 'asc'
                      ? 'ascending'
                      : sort.find((s) => s.field === col.name)?.direction === 'desc'
                        ? 'descending'
                        : undefined
                  }
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-xs text-text-muted">{getSortIcon(col.name)}</span>
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  className={cn(
                    compact ? 'px-3 py-2' : 'p-3',
                    'w-24 text-center font-medium text-text-secondary',
                  )}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="p-8 text-center text-text-muted">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="p-8 text-center text-text-muted">
                  {emptyContent || 'No data'}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row[primaryKey] || idx}
                  className={cn(
                    'border-b border-border hover:bg-bg-secondary transition-colors',
                    selectedRows.includes(row[primaryKey]) && 'bg-primary-50',
                    striped && idx % 2 === 1 && 'bg-bg-secondary',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {onRowSelect && (
                    <td className="w-10 p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row[primaryKey])}
                        onChange={() => handleSelectRow(row[primaryKey])}
                        className="rounded"
                        aria-label={`Select row ${row[primaryKey]}`}
                      />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td key={col.name} className={compact ? 'px-3 py-2' : 'p-3'}>
                      {cellRenderers?.[col.name]
                        ? cellRenderers[col.name](row[col.name], row, col)
                        : renderCell(row[col.name], col)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td
                      className={cn(compact ? 'px-3 py-2' : 'p-3', 'text-center')}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-1">
                        {onEdit && (
                          <BaseButton size="sm" variant="ghost" onClick={() => onEdit(row)}>
                            Edit
                          </BaseButton>
                        )}
                        {onDelete && (
                          <BaseButton size="sm" variant="ghost" onClick={() => onDelete(row)}>
                            Delete
                          </BaseButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (composed) */}
      {showPagination && total > 0 && (
        <BasePagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          className="mt-4"
        />
      )}
    </div>
  );
}

function renderCell(value: any, col: ColumnConfig): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-text-muted">—</span>;

  switch (col.type) {
    case 'boolean':
      return (
        <span className={value ? 'text-success' : 'text-text-muted'}>{value ? '✓' : '✗'}</span>
      );
    case 'date':
      return new Date(value).toLocaleDateString('vi-VN');
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    case 'select': {
      const option = col.options?.find((o) => o.value === value);
      return option?.label || String(value);
    }
    default:
      return String(value).length > 100 ? String(value).slice(0, 100) + '...' : String(value);
  }
}
