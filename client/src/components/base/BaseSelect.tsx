import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// BaseSelect - CVA-driven select dropdown
// Pure presentational – nhận props, render UI
// ============================================================

const selectVariants = cva(
  [
    'w-full rounded-md border bg-bg text-text transition-colors appearance-none',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 focus:border-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-tertiary',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 pr-8 text-xs',
        md: 'h-10 px-3 pr-9 text-sm',
        lg: 'h-12 px-4 pr-10 text-base',
      },
      variant: {
        default: 'border-border hover:border-border-hover',
        error: 'border-danger focus:ring-danger',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface BaseSelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const BaseSelect = React.forwardRef<HTMLSelectElement, BaseSelectProps>(
  ({ className, size, variant, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;
    const resolvedVariant = error ? 'error' : variant;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(selectVariants({ size, variant: resolvedVariant }), className)}
            aria-invalid={Boolean(error)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {error && (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

BaseSelect.displayName = 'BaseSelect';
