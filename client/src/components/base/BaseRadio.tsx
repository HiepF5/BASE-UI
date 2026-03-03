import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// BaseRadio - Radio group with accessible fieldset
// Pure presentational
// ============================================================

export interface RadioOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

export interface BaseRadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  label?: string;
  error?: string;
  hint?: string;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const radioSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function BaseRadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  hint,
  direction = 'vertical',
  size = 'md',
  disabled,
  required,
  className,
}: BaseRadioGroupProps) {
  return (
    <fieldset className={cn('flex flex-col gap-1.5', className)} disabled={disabled}>
      {label && (
        <legend className="text-sm font-medium text-text-secondary mb-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </legend>
      )}

      <div
        className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
        role="radiogroup"
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'inline-flex items-start gap-2 cursor-pointer',
              (disabled || opt.disabled) && 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={disabled || opt.disabled}
              className={cn(
                radioSizeClasses[size],
                'shrink-0 border-border text-primary cursor-pointer mt-0.5',
                'focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                error && 'border-danger',
              )}
            />
            <div className="flex flex-col">
              <span className={cn('text-text', labelSizeClasses[size])}>{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-text-muted">{opt.description}</span>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </fieldset>
  );
}
