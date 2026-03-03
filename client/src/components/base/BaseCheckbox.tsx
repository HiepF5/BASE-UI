import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// BaseCheckbox - Accessible checkbox with label
// Pure presentational
// ============================================================

export interface BaseCheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const BaseCheckbox = React.forwardRef<HTMLInputElement, BaseCheckboxProps>(
  ({ className, label, description, error, size = 'md', indeterminate, id, ...props }, ref) => {
    const checkboxId = id || props.name;
    const innerRef = React.useRef<HTMLInputElement>(null);

    // Handle indeterminate state (not possible via HTML attribute)
    React.useEffect(() => {
      const el = (ref as React.RefObject<HTMLInputElement>)?.current || innerRef.current;
      if (el) {
        el.indeterminate = !!indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex items-start gap-2 cursor-pointer',
            props.disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <input
            ref={ref || innerRef}
            type="checkbox"
            id={checkboxId}
            className={cn(
              sizeClasses[size],
              'shrink-0 rounded border-border text-primary cursor-pointer mt-0.5',
              'focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
              error && 'border-danger',
            )}
            aria-invalid={!!error}
            {...props}
          />
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className={cn('font-medium text-text', labelSizeClasses[size])}>{label}</span>
              )}
              {description && <span className="text-xs text-text-muted">{description}</span>}
            </div>
          )}
        </label>

        {error && (
          <p className="text-xs text-danger ml-6" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

BaseCheckbox.displayName = 'BaseCheckbox';
