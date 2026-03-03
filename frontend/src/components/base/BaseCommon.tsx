import React from 'react';
import { AlertTriangle, X, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/core/utils';
import { BaseButton } from './BaseButton';
import { BaseModal } from './BaseModal';

/* ── Confirm Dialog ── */
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const iconMap = {
  danger:  <AlertTriangle className="h-6 w-6 text-danger-500" />,
  warning: <AlertTriangle className="h-6 w-6 text-warning-500" />,
  info:    <Info className="h-6 w-6 text-primary-500" />,
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
}) => (
  <BaseModal open={open} onClose={onClose} size="sm" showCloseBtn={false}>
    <div className="flex gap-4">
      <div className="shrink-0">{iconMap[variant]}</div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
      </div>
    </div>
    <div className="mt-5 flex justify-end gap-3">
      <BaseButton variant="secondary" onClick={onClose}>
        {cancelText}
      </BaseButton>
      <BaseButton
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </BaseButton>
    </div>
  </BaseModal>
);

/* ── Empty State ── */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Không có dữ liệu',
  description,
  action,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
    {icon && <div className="mb-3 text-gray-300">{icon}</div>}
    <h3 className="text-base font-semibold text-gray-600">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ── Badge ── */
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger:  'bg-danger-50 text-danger-700',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => (
  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeVariants[variant], className)}>
    {children}
  </span>
);

/* ── Spinner ── */
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size];
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-primary-200 border-t-primary-600', sizeClass, className)}
    />
  );
};

/* ── Skeleton ── */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded bg-gray-200', className)} />
);

/* ── Card ── */
export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  actions,
  className,
  bodyClassName,
}) => (
  <div className={cn('rounded-xl border border-gray-200 bg-white shadow-card', className)}>
    {(title || actions) && (
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div>
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className={cn('p-5', bodyClassName)}>{children}</div>
  </div>
);

/* ── Tabs ── */
export interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className }) => (
  <div className={cn('flex border-b border-gray-200', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => !tab.disabled && onChange(tab.key)}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === tab.key
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700',
          tab.disabled && 'opacity-40 cursor-not-allowed',
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);
