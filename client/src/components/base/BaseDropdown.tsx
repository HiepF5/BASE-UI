import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../../core/utils';

// ============================================================
// BaseDropdown - Action menu / dropdown select
// Pure presentational, CVA-driven, themed via CSS variables
// Supports: items, dividers, disabled, icons, keyboard nav
// ============================================================

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  /** Custom render override */
  render?: () => React.ReactNode;
}

export interface DropdownDivider {
  key: string;
  type: 'divider';
}

export type DropdownMenuEntry = DropdownItem | DropdownDivider;

export interface BaseDropdownProps {
  /** Trigger element (render prop) */
  trigger: (ctx: { open: boolean; toggle: () => void }) => React.ReactNode;
  /** Menu items */
  items: DropdownMenuEntry[];
  /** Placement */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Min width of menu */
  minWidth?: number;
  /** Close on item click */
  closeOnSelect?: boolean;
  /** Controlled */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** On item click */
  onSelect?: (key: string) => void;
  className?: string;
}

function isDivider(entry: DropdownMenuEntry): entry is DropdownDivider {
  return 'type' in entry && entry.type === 'divider';
}

export function BaseDropdown({
  trigger,
  items,
  placement = 'bottom-start',
  minWidth = 180,
  closeOnSelect = true,
  open: controlledOpen,
  onOpenChange,
  onSelect,
  className,
}: BaseDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (value: boolean) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
      if (!value) setFocusIndex(-1);
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  const selectableItems = useMemo(
    () => items.filter((item): item is DropdownItem => !isDivider(item) && !item.disabled),
    [items],
  );

  // ── Close on outside click ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpen]);

  // ── Keyboard navigation ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => {
            const next = prev + 1;
            return next >= selectableItems.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? selectableItems.length - 1 : next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < selectableItems.length) {
            const item = selectableItems[focusIndex];
            onSelect?.(item.key);
            if (closeOnSelect) setOpen(false);
          }
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, focusIndex, selectableItems, closeOnSelect, onSelect, setOpen]);

  // ── Placement classes ───────────────────────────────────────
  const placementClasses: Record<string, string> = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect?.(item.key);
    if (closeOnSelect) setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      {trigger({ open: isOpen, toggle })}

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            'absolute z-50 py-1',
            placementClasses[placement],
            'bg-bg-elevated border border-border rounded-lg shadow-lg',
            'animate-in fade-in zoom-in-95',
            className,
          )}
          style={{ minWidth }}
        >
          {items.map((entry) => {
            if (isDivider(entry)) {
              return (
                <div key={entry.key} className="my-1 border-t border-border" role="separator" />
              );
            }

            const item = entry;
            const selectableIdx = selectableItems.findIndex((s) => s.key === item.key);
            const isFocused = selectableIdx === focusIndex;

            return (
              <button
                key={item.key}
                role="menuitem"
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                  item.disabled
                    ? 'text-text-muted cursor-not-allowed opacity-50'
                    : item.danger
                      ? 'text-danger hover:bg-danger-light'
                      : 'text-text hover:bg-bg-tertiary',
                  isFocused &&
                    !item.disabled &&
                    (item.danger ? 'bg-danger-light' : 'bg-bg-tertiary'),
                )}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setFocusIndex(selectableIdx)}
              >
                {item.render ? (
                  item.render()
                ) : (
                  <>
                    {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                    {item.label}
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
