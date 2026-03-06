import React from 'react';

// ============================================================
// FooterStats - Shows record count and selection info
// ============================================================

export interface FooterStatsComponentProps {
  page: number;
  limit: number;
  total: number;
  selectedCount: number;
  fieldCount: number;
  relationCount: number;
}

export function FooterStats({
  page,
  limit,
  total,
  selectedCount,
  fieldCount,
  relationCount,
}: FooterStatsComponentProps) {
  return (
    <div className="flex items-center justify-between text-xs text-text-muted border-t border-neutral-200 pt-3">
      <span>
        {total > 0
          ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} records`
          : 'No records match'}
      </span>
      <div className="flex items-center gap-3">
        {selectedCount > 0 && <span>{selectedCount} selected</span>}
        <span className="text-neutral-400">
          {fieldCount} fields | {relationCount} relations
        </span>
      </div>
    </div>
  );
}

FooterStats.displayName = 'FooterStats';
