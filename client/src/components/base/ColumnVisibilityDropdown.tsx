import React, { useState, useRef, useEffect } from 'react';
import { BaseButton } from './BaseButton';
import { cn } from '../../core/utils';
import type { ColumnConfig } from '../../types';

// ============================================================
// ColumnVisibilityDropdown - Toggle column visibility
// Dropdown menu with checkboxes for each column
// Pure presentational – state managed by parent
// ============================================================

export interface ColumnVisibilityDropdownProps {
  /** All columns (both visible and hidden) */
  columns: ColumnConfig[];
  /** Callback when visibility changes */
  onToggle: (columnName: string, visible: boolean) => void;
  /** Reset all to visible */
  onResetAll?: () => void;
  /** Custom class */
  className?: string;
}

export function ColumnVisibilityDropdown({
  columns,
  onToggle,
  onResetAll,
  className,
}: ColumnVisibilityDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const visibleCount = columns.filter((c) => c.visible).length;
  const allVisible = visibleCount === columns.length;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <BaseButton
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 4h6M4 8h16M6 12h12M8 16h8M10 20h4"
            />
          </svg>
          Columns
          <span className="text-xs text-text-muted">
            ({visibleCount}/{columns.length})
          </span>
        </span>
      </BaseButton>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white border border-border rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Toggle Columns</span>
            {onResetAll && !allVisible && (
              <button
                onClick={onResetAll}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Show All
              </button>
            )}
          </div>

          {/* Column list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {columns.map((col) => (
              <label
                key={col.name}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-bg-secondary cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => onToggle(col.name, !col.visible)}
                  className="rounded border-border text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-text-primary">{col.label}</span>
                <span className="text-xs text-text-muted ml-auto">{col.type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ColumnVisibilityDropdown.displayName = 'ColumnVisibilityDropdown';
