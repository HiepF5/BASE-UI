import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// BaseSwitch - Toggle switch component
// Pure presentational – accessible toggle
// ============================================================

const switchTrackVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
    'transition-colors duration-200 ease-in-out',
    'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-[3.25rem]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const switchThumbSize = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const switchThumbTranslate = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-6',
};

export interface BaseSwitchProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof switchTrackVariants> {
  label?: string;
  description?: string;
  error?: string;
}

export const BaseSwitch = React.forwardRef<HTMLInputElement, BaseSwitchProps>(
  ({ className, size = 'md', label, description, error, checked, disabled, id, ...props }, ref) => {
    const switchId = id || props.name;
    const sz = size || 'md';

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label
          htmlFor={switchId}
          className={cn(
            'inline-flex items-center gap-3 cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className="relative inline-flex items-center">
            <input
              ref={ref}
              type="checkbox"
              role="switch"
              id={switchId}
              checked={checked}
              disabled={disabled}
              className="sr-only peer"
              aria-checked={checked}
              {...props}
            />
            {/* Track */}
            <span
              className={cn(switchTrackVariants({ size }), checked ? 'bg-primary' : 'bg-border')}
            >
              {/* Thumb */}
              <span
                className={cn(
                  'pointer-events-none inline-block rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ease-in-out',
                  switchThumbSize[sz],
                  checked ? switchThumbTranslate[sz] : 'translate-x-0',
                )}
              />
            </span>
          </span>

          {(label || description) && (
            <div className="flex flex-col">
              {label && <span className="text-sm font-medium text-text">{label}</span>}
              {description && <span className="text-xs text-text-muted">{description}</span>}
            </div>
          )}
        </label>

        {error && (
          <p className="text-xs text-danger ml-12" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

BaseSwitch.displayName = 'BaseSwitch';
