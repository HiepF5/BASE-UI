import React from 'react';
import { cn } from '../../core/utils';
import { BaseButton } from './BaseButton';

// ============================================================
// BasePagination - Standalone pagination component
// Pure presentational, CVA-driven, themed via CSS variables
// ============================================================

export interface BasePaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total item count */
  total: number;
  /** Available page-size options */
  pageSizeOptions?: number[];
  /** Show page-size selector */
  showSizeChanger?: boolean;
  /** Show total info text */
  showTotal?: boolean;
  /** Max page buttons to show */
  maxPageButtons?: number;
  /** Compact mode hides some UI */
  compact?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const BasePagination = React.memo(function BasePagination({
  page,
  limit,
  total,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = true,
  showTotal = true,
  maxPageButtons = 5,
  compact = false,
  className,
  onPageChange,
  onLimitChange,
}: BasePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // ── Build page number array ─────────────────────────────────
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxPageButtons / 2);
    let start = Math.max(2, page - half);
    let end = Math.min(totalPages - 1, page + half);

    // Shift window if near edges
    if (page <= half + 1) {
      end = Math.min(totalPages - 1, maxPageButtons - 1);
    }
    if (page >= totalPages - half) {
      start = Math.max(2, totalPages - maxPageButtons + 2);
    }

    pages.push(1);
    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('ellipsis');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      {/* Total info */}
      {showTotal && !compact && (
        <div className="text-sm text-text-muted">
          Showing <span className="font-medium text-text">{startItem}</span>–
          <span className="font-medium text-text">{endItem}</span> of{' '}
          <span className="font-medium text-text">{total}</span>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Page size changer */}
        {showSizeChanger && onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className={cn(
              'border border-border rounded-md px-2 py-1 text-sm',
              'bg-bg text-text focus:border-border-focus focus:ring-1 focus:ring-primary-500 outline-none',
            )}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}

        {/* Prev button */}
        <BaseButton
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </BaseButton>

        {/* Page numbers */}
        {!compact &&
          getPageNumbers().map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-text-muted text-sm select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[2rem] h-8 rounded-md text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary text-text-inverse'
                    : 'text-text-secondary hover:bg-bg-tertiary',
                )}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ),
          )}

        {/* Compact mode: show page / total */}
        {compact && (
          <span className="text-sm text-text-secondary px-2">
            {page} / {totalPages}
          </span>
        )}

        {/* Next button */}
        <BaseButton
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next ›
        </BaseButton>
      </div>
    </div>
  );
});

BasePagination.displayName = 'BasePagination';
