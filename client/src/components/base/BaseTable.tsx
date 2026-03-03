import React, { useState } from 'react';
import { cn } from '../../core/utils';
import { BaseButton } from './BaseButton';
import type { ColumnConfig, SortOption } from '../../types';

// ============================================================
// BaseTable - Dynamic table with sort, select, pagination
// ============================================================
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
  onPageChange,
  onLimitChange,
  onSort,
  onRowSelect,
  onRowClick,
  onEdit,
  onDelete,
}: BaseTableProps) {
  const visibleColumns = columns.filter((col) => col.visible);
  const totalPages = Math.ceil(total / limit);

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
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              {onRowSelect && (
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.name}
                  className={cn(
                    'p-3 text-left font-medium text-neutral-600',
                    col.sortable && 'cursor-pointer hover:text-neutral-900',
                  )}
                  style={{ width: col.width ? `${col.width}px` : undefined }}
                  onClick={() => col.sortable && handleSort(col.name)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-xs text-neutral-400">{getSortIcon(col.name)}</span>
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="w-24 p-3 text-center font-medium text-neutral-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="p-8 text-center text-neutral-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="p-8 text-center text-neutral-400">
                  No data
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row[primaryKey] || idx}
                  className={cn(
                    'border-b hover:bg-neutral-50 transition-colors',
                    selectedRows.includes(row[primaryKey]) && 'bg-primary-50',
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
                      />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td key={col.name} className="p-3">
                      {renderCell(row[col.name], col)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-neutral-500">
          Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <BaseButton
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </BaseButton>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <BaseButton
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  );
}

function renderCell(value: any, col: ColumnConfig): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-neutral-300">—</span>;

  switch (col.type) {
    case 'boolean':
      return value ? '✓' : '✗';
    case 'date':
      return new Date(value).toLocaleDateString('vi-VN');
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    default:
      return String(value).length > 100 ? String(value).slice(0, 100) + '...' : String(value);
  }
}
