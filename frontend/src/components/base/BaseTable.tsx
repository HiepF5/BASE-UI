import React, { useMemo, useState, useCallback } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  MoreHorizontal, Edit, Trash2, Eye,
} from 'lucide-react';
import { cn, formatDate, formatNumber } from '@/core/utils';
import { BaseButton } from './BaseButton';
import type { ColumnConfig, SortOption, PaginatedResult } from '@/types';

/* ── Props ── */

export interface BaseTableProps<T = any> {
  columns: ColumnConfig[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  sort?: SortOption[];
  loading?: boolean;
  selectedIds?: Set<string>;
  primaryKey?: string;

  onSort?: (sort: SortOption[]) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;

  className?: string;
  emptyMessage?: string;
}

export function BaseTable<T extends Record<string, any>>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 25,
  sort = [],
  loading = false,
  selectedIds,
  primaryKey = 'id',
  onSort,
  onPageChange,
  onLimitChange,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onSelect,
  onSelectAll,
  className,
  emptyMessage = 'Không có dữ liệu',
}: BaseTableProps<T>) {
  const visibleCols = useMemo(() => columns.filter((c) => c.visible !== false), [columns]);
  const totalPages = Math.ceil(total / limit) || 1;
  const hasActions = !!(onEdit || onDelete || onView);

  /* Sort toggle */
  const handleSort = (field: string) => {
    if (!onSort) return;
    const existing = sort.find((s) => s.field === field);
    if (!existing) {
      onSort([{ field, direction: 'asc' }]);
    } else if (existing.direction === 'asc') {
      onSort([{ field, direction: 'desc' }]);
    } else {
      onSort([]);
    }
  };

  /* Select all */
  const allSelected =
    selectedIds && data.length > 0 && data.every((r) => selectedIds.has(String(r[primaryKey])));

  /* Cell render */
  const renderCell = (col: ColumnConfig, row: T) => {
    const val = row[col.name];
    if (col.render) return col.render(val, row);
    if (val == null) return <span className="text-gray-400">—</span>;
    switch (col.type) {
      case 'boolean':
        return (
          <span className={cn('inline-block h-2 w-2 rounded-full', val ? 'bg-success-500' : 'bg-gray-300')} />
        );
      case 'date':
      case 'datetime':
        return formatDate(val);
      case 'number':
        return formatNumber(val);
      default:
        return String(val).length > 80 ? `${String(val).slice(0, 80)}…` : String(val);
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox col */}
              {onSelect && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() =>
                      allSelected
                        ? onSelectAll?.([])
                        : onSelectAll?.(data.map((r) => String(r[primaryKey])))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
              )}
              {visibleCols.map((col) => (
                <th
                  key={col.name}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-gray-600 select-none',
                    col.sortable && 'cursor-pointer hover:text-gray-900',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.name)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon field={col.name} sort={sort} />
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="w-24 px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td
                  colSpan={visibleCols.length + (onSelect ? 1 : 0) + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    Đang tải…
                  </div>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={visibleCols.length + (onSelect ? 1 : 0) + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              data.map((row, idx) => {
                const rowId = String(row[primaryKey]);
                const selected = selectedIds?.has(rowId);
                return (
                  <tr
                    key={rowId ?? idx}
                    className={cn(
                      'transition-colors hover:bg-gray-50',
                      selected && 'bg-primary-50',
                      onRowClick && 'cursor-pointer',
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {onSelect && (
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => onSelect(rowId)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                    )}
                    {visibleCols.map((col) => (
                      <td key={col.name} className="px-4 py-2 text-gray-700">
                        {renderCell(col, row)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {onView && (
                            <BaseButton
                              variant="ghost"
                              size="icon"
                              onClick={() => onView(row)}
                              title="Xem"
                            >
                              <Eye className="h-4 w-4" />
                            </BaseButton>
                          )}
                          {onEdit && (
                            <BaseButton
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(row)}
                              title="Sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </BaseButton>
                          )}
                          {onDelete && (
                            <BaseButton
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(row)}
                              title="Xóa"
                              className="hover:text-danger-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </BaseButton>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-1 pt-3">
          <div className="text-sm text-gray-500">
            Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {formatNumber(total)}
          </div>

          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
              value={limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / trang</option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <BaseButton variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPageChange?.(1)}>
                <ChevronsLeft className="h-4 w-4" />
              </BaseButton>
              <BaseButton variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </BaseButton>
              <span className="px-2 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <BaseButton variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </BaseButton>
              <BaseButton variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => onPageChange?.(totalPages)}>
                <ChevronsRight className="h-4 w-4" />
              </BaseButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SortIcon helper ── */
function SortIcon({ field, sort }: { field: string; sort: SortOption[] }) {
  const s = sort.find((s) => s.field === field);
  if (!s) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
  return s.direction === 'asc'
    ? <ArrowUp className="ml-1 h-3 w-3 text-primary-600" />
    : <ArrowDown className="ml-1 h-3 w-3 text-primary-600" />;
}
