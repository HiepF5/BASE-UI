import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// BaseToast - Toast notification system
// Includes ToastProvider context + useToast hook
// ============================================================

// ── Types ────────────────────────────────────────────────────
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ── CVA Variants ─────────────────────────────────────────────
const toastVariants = cva(
  [
    'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg',
    'animate-slide-in transition-all',
  ].join(' '),
  {
    variants: {
      variant: {
        info: 'border-info/30 bg-bg-elevated text-text',
        success: 'border-success/30 bg-bg-elevated text-text',
        warning: 'border-warning/30 bg-bg-elevated text-text',
        danger: 'border-danger/30 bg-bg-elevated text-text',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

const dotColor: Record<ToastVariant, string> = {
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

// ── Context ──────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

// ── Single Toast ─────────────────────────────────────────────
interface ToastCardProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ item, onDismiss }: ToastCardProps) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(item.id), 150);
  }, [item.id, onDismiss]);

  useEffect(() => {
    const dur = item.duration ?? 4000;
    if (dur > 0) {
      timerRef.current = setTimeout(handleDismiss, dur);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.duration, handleDismiss]);

  return (
    <div
      className={cn(toastVariants({ variant: item.variant }), exiting && 'opacity-0 translate-y-2')}
      role="alert"
    >
      {/* Colored dot */}
      <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', dotColor[item.variant])} />

      <div className="flex-1 min-w-0">
        {item.title && <p className="text-sm font-semibold">{item.title}</p>}
        <p className="text-sm text-text-secondary">{item.message}</p>
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 rounded p-1 text-text-muted hover:text-text transition-colors focus:outline-none"
        aria-label="Dismiss"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────
const MAX_TOASTS = 5;

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Position of toast container */
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const positionClasses: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastProvider({ children, position = 'top-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => {
      const next = [...prev, { ...options, id }];
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (message, title) => addToast({ message, title, variant: 'success' }),
    error: (message, title) => addToast({ message, title, variant: 'danger' }),
    warning: (message, title) => addToast({ message, title, variant: 'warning' }),
    info: (message, title) => addToast({ message, title, variant: 'info' }),
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container */}
      <div
        className={cn(
          'fixed z-toast pointer-events-none flex w-full max-w-sm flex-col gap-2',
          positionClasses[position],
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
