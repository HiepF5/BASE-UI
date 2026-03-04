import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../core/utils';

// ============================================================
// BasePopover - Floating content anchored to a trigger element
// Pure presentational, positioned via JS, themed via CSS variables
// ============================================================

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right';

export interface BasePopoverProps {
  /** Trigger element (render prop receives { open, toggle, close }) */
  trigger: (ctx: { open: boolean; toggle: () => void; close: () => void }) => React.ReactNode;
  /** Popover content */
  children: React.ReactNode;
  /** Placement relative to trigger */
  placement?: PopoverPlacement;
  /** Close on outside click */
  closeOnOutsideClick?: boolean;
  /** Close on ESC */
  closeOnEsc?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Controlled change handler */
  onOpenChange?: (open: boolean) => void;
  /** Content width */
  width?: number | string;
  className?: string;
}

export function BasePopover({
  trigger,
  children,
  placement = 'bottom-start',
  closeOnOutsideClick = true,
  closeOnEsc = true,
  open: controlledOpen,
  onOpenChange,
  width,
  className,
}: BasePopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (value: boolean) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  // ── Close on outside click ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeOnOutsideClick, close]);

  // ── Close on ESC ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeOnEsc, close]);

  // ── Compute position classes ────────────────────────────────
  const positionClasses: Record<PopoverPlacement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <div ref={triggerRef}>{trigger({ open: isOpen, toggle, close })}</div>

      {/* Content */}
      {isOpen && (
        <div
          ref={contentRef}
          role="dialog"
          className={cn(
            'absolute z-50',
            positionClasses[placement],
            'bg-bg-elevated border border-border rounded-lg shadow-lg',
            'animate-in fade-in zoom-in-95',
            className,
          )}
          style={{ width: width ?? undefined }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
