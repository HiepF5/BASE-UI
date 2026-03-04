import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// BaseDatePicker - Native date input with consistent styling
// Pure presentational
// ============================================================

export interface BaseDatePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'date' | 'datetime-local' | 'time' */
  mode?: 'date' | 'datetime-local' | 'time';
}

const sizeClasses = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
};

export const BaseDatePicker = React.forwardRef<HTMLInputElement, BaseDatePickerProps>(
  ({ className, label, error, hint, size = 'md', mode = 'date', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type={mode}
          id={inputId}
          className={cn(
            'w-full rounded-md border bg-bg text-text transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 focus:border-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-tertiary',
            error ? 'border-danger focus:ring-danger' : 'border-border hover:border-border-hover',
            sizeClasses[size],
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />

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

BaseDatePicker.displayName = 'BaseDatePicker';
