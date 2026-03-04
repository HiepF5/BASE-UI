import React, { useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// BaseDrawer - Slide-in overlay panel (left / right / top / bottom)
// Pure presentational, themed via CSS variables
// ============================================================

const drawerVariants = cva(
  'fixed bg-bg shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out',
  {
    variants: {
      placement: {
        left: 'top-0 left-0 h-full',
        right: 'top-0 right-0 h-full',
        top: 'top-0 left-0 w-full',
        bottom: 'bottom-0 left-0 w-full',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
        full: '',
      },
    },
    compoundVariants: [
      // Horizontal drawers (left/right) → width
      { placement: 'left', size: 'sm', class: 'w-64' },
      { placement: 'left', size: 'md', class: 'w-80' },
      { placement: 'left', size: 'lg', class: 'w-[28rem]' },
      { placement: 'left', size: 'xl', class: 'w-[36rem]' },
      { placement: 'left', size: 'full', class: 'w-screen' },
      { placement: 'right', size: 'sm', class: 'w-64' },
      { placement: 'right', size: 'md', class: 'w-80' },
      { placement: 'right', size: 'lg', class: 'w-[28rem]' },
      { placement: 'right', size: 'xl', class: 'w-[36rem]' },
      { placement: 'right', size: 'full', class: 'w-screen' },
      // Vertical drawers (top/bottom) → height
      { placement: 'top', size: 'sm', class: 'h-48' },
      { placement: 'top', size: 'md', class: 'h-64' },
      { placement: 'top', size: 'lg', class: 'h-96' },
      { placement: 'top', size: 'xl', class: 'h-[28rem]' },
      { placement: 'top', size: 'full', class: 'h-screen' },
      { placement: 'bottom', size: 'sm', class: 'h-48' },
      { placement: 'bottom', size: 'md', class: 'h-64' },
      { placement: 'bottom', size: 'lg', class: 'h-96' },
      { placement: 'bottom', size: 'xl', class: 'h-[28rem]' },
      { placement: 'bottom', size: 'full', class: 'h-screen' },
    ],
    defaultVariants: {
      placement: 'right',
      size: 'md',
    },
  },
);

export interface BaseDrawerProps extends VariantProps<typeof drawerVariants> {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Footer content (e.g. action buttons) */
  footer?: React.ReactNode;
  /** Show close button */
  showClose?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  className?: string;
}

/** Translate classes when drawer is CLOSED */
const closedTransform: Record<string, string> = {
  left: '-translate-x-full',
  right: 'translate-x-full',
  top: '-translate-y-full',
  bottom: 'translate-y-full',
};

export function BaseDrawer({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'right',
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className,
}: BaseDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ── Close on ESC ────────────────────────────────────────────
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, closeOnEsc]);

  // ── Prevent body scroll ─────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ── Focus trap (basic) ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    drawerRef.current?.focus();
    return () => prev?.focus?.();
  }, [open]);

  const resolvedPlacement = placement ?? 'right';

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          drawerVariants({ placement, size }),
          open ? 'translate-x-0 translate-y-0' : closedTransform[resolvedPlacement],
          className,
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text text-xl leading-none ml-auto"
                aria-label="Close drawer"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 border-t border-border shrink-0">{footer}</div>}
      </div>
    </>
  );
}
