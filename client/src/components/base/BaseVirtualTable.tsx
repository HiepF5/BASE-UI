import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { cn } from '../../core/utils';
import { BasePagination } from './BasePagination';
import type { ColumnConfig, SortOption } from '../../types';

// ============================================================
// BaseVirtualTable – Virtualized table for large datasets
// Renders only visible rows in viewport via windowing.
// Uses same ColumnConfig/SortOption/CellRenderer API as BaseTable.
// Rule: Lists > 100 rows → virtual scrolling.
// Phase 5 – Performance: Virtual table
// ============================================================

/** Custom cell renderer (same as BaseTable) */
export type VirtualCellRenderer = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
  col: ColumnConfig,
) => React.ReactNode;

export interface BaseVirtualTableProps {
  columns: ColumnConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  total: number;
  page: number;
  limit: number;
  sort?: SortOption[];
  selectedRows?: string[];
  loading?: boolean;
  primaryKey?: string;
  /** Row height in px (default 40) */
  rowHeight?: number;
  /** Max viewport height in px (default 600) */
  maxHeight?: number;
  /** Overscan rows above/below viewport (default 5) */
  overscan?: number;
  striped?: boolean;
  compact?: boolean;
  showPagination?: boolean;
  cellRenderers?: Record<string, VirtualCellRenderer>;
  emptyContent?: React.ReactNode;
  className?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort?: (sort: SortOption[]) => void;
  onRowSelect?: (ids: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (row: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit?: (row: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete?: (row: any) => void;
}

export const BaseVirtualTable = React.memo(function BaseVirtualTable({
  columns,
  data,
  total,
  page,
  limit,
  sort = [],
  selectedRows = [],
  loading,
  primaryKey = 'id',
  rowHeight = 40,
  maxHeight = 600,
  overscan = 5,
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
}: BaseVirtualTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const visibleColumns = useMemo(() => columns.filter((col) => col.visible !== false), [columns]);

  // ── Virtualization math ──────────────────────────────────
  const totalHeight = data.length * rowHeight;
  const viewportHeight = Math.min(maxHeight, totalHeight || rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
  const endIndex = Math.min(data.length, startIndex + visibleCount);
  const offsetY = startIndex * rowHeight;

  const visibleRows = useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Reset scroll on data change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [page, data.length]);

  // ── Sort handler ─────────────────────────────────────────
  const handleSort = useCallback(
    (columnName: string) => {
      if (!onSort) return;
      const existing = sort.find((s) => s.field === columnName);
      if (!existing) {
        onSort([{ field: columnName, direction: 'asc' }]);
      } else if (existing.direction === 'asc') {
        onSort([{ field: columnName, direction: 'desc' }]);
      } else {
        onSort([]);
      }
    },
    [onSort, sort],
  );

  // ── Row selection ────────────────────────────────────────
  const handleSelectAll = useCallback(() => {
    if (!onRowSelect) return;
    if (selectedRows.length === data.length) {
      onRowSelect([]);
    } else {
      onRowSelect(data.map((row) => row[primaryKey]));
    }
  }, [onRowSelect, selectedRows.length, data, primaryKey]);

  const handleSelectRow = useCallback(
    (id: string) => {
      if (!onRowSelect) return;
      if (selectedRows.includes(id)) {
        onRowSelect(selectedRows.filter((r) => r !== id));
      } else {
        onRowSelect([...selectedRows, id]);
      }
    },
    [onRowSelect, selectedRows],
  );

  // ── Render cell ──────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCell = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row: any, col: ColumnConfig) => {
      const value = row[col.name];
      if (cellRenderers?.[col.name]) {
        return cellRenderers[col.name](value, row, col);
      }
      return value !== null && value !== undefined ? String(value) : '—';
    },
    [cellRenderers],
  );

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-bg', className)}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-bg/60 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
        </div>
      )}

      {/* Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 bg-bg-secondary border-b border-border">
            <tr>
              {/* Select column */}
              {onRowSelect && (
                <th className={cn('w-10', compact ? 'px-2 py-1' : 'px-3 py-2')}>
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
              )}

              {visibleColumns.map((col) => {
                const sorted = sort.find((s) => s.field === col.name);
                return (
                  <th
                    key={col.name}
                    className={cn(
                      'text-left text-xs font-semibold text-text-muted uppercase tracking-wider',
                      compact ? 'px-2 py-1' : 'px-3 py-2',
                      col.sortable && 'cursor-pointer hover:text-text select-none',
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.name)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sorted && (
                        <span className="text-primary-500">
                          {sorted.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}

              {/* Actions column */}
              {(onEdit || onDelete) && (
                <th
                  className={cn(
                    'text-right text-xs font-semibold text-text-muted uppercase',
                    compact ? 'px-2 py-1' : 'px-3 py-2',
                  )}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {/* Empty state */}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length + (onRowSelect ? 1 : 0) + (onEdit || onDelete ? 1 : 0)
                  }
                  className="text-center py-12 text-text-muted"
                >
                  {emptyContent ?? 'No data'}
                </td>
              </tr>
            )}

            {/* Spacer for virtualization offset */}
            {data.length > 0 && offsetY > 0 && (
              <tr style={{ height: offsetY }}>
                <td
                  colSpan={
                    visibleColumns.length + (onRowSelect ? 1 : 0) + (onEdit || onDelete ? 1 : 0)
                  }
                />
              </tr>
            )}

            {/* Visible rows */}
            {visibleRows.map((row, idx) => {
              const rowId = String(row[primaryKey]);
              const isSelected = selectedRows.includes(rowId);
              const actualIdx = startIndex + idx;

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'border-b border-border/50 transition-colors',
                    isSelected && 'bg-primary-50',
                    striped && actualIdx % 2 === 1 && !isSelected && 'bg-bg-secondary/50',
                    onRowClick && 'cursor-pointer hover:bg-bg-tertiary',
                  )}
                  style={{ height: rowHeight }}
                  onClick={() => onRowClick?.(row)}
                >
                  {onRowSelect && (
                    <td className={compact ? 'px-2 py-1' : 'px-3 py-2'}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border"
                      />
                    </td>
                  )}

                  {visibleColumns.map((col) => (
                    <td
                      key={col.name}
                      className={cn('text-text truncate', compact ? 'px-2 py-1' : 'px-3 py-2')}
                      style={col.width ? { maxWidth: col.width } : undefined}
                    >
                      {renderCell(row, col)}
                    </td>
                  ))}

                  {(onEdit || onDelete) && (
                    <td className={cn('text-right', compact ? 'px-2 py-1' : 'px-3 py-2')}>
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 px-1.5 py-0.5 rounded hover:bg-primary-50"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            className="text-xs text-danger hover:text-danger-hover px-1.5 py-0.5 rounded hover:bg-danger/5"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Bottom spacer */}
            {data.length > 0 && endIndex < data.length && (
              <tr style={{ height: (data.length - endIndex) * rowHeight }}>
                <td
                  colSpan={
                    visibleColumns.length + (onRowSelect ? 1 : 0) + (onEdit || onDelete ? 1 : 0)
                  }
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="border-t border-border px-4 py-2">
          <BasePagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </div>
      )}
    </div>
  );
});

BaseVirtualTable.displayName = 'BaseVirtualTable';
