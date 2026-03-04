import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// BaseButton - CVA-driven button component
// Themed via CSS variables (Design System tokens)
// ============================================================
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-text-inverse hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-bg-tertiary text-text-secondary hover:bg-border focus:ring-primary-500',
        danger: 'bg-danger text-text-inverse hover:bg-danger-hover focus:ring-danger',
        ghost: 'hover:bg-bg-tertiary text-text-secondary',
        outline: 'border border-border text-text hover:bg-bg-tertiary focus:ring-primary-500',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const BaseButton = React.memo(function BaseButton({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: BaseButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

BaseButton.displayName = 'BaseButton';
