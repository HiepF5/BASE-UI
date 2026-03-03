import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// BaseSpinner - Loading indicator
// Pure presentational
// ============================================================

const spinnerVariants = cva('animate-spin rounded-full border-current border-t-transparent', {
  variants: {
    size: {
      xs: 'h-3 w-3 border',
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-[3px]',
      xl: 'h-12 w-12 border-4',
    },
    color: {
      primary: 'text-primary',
      white: 'text-white',
      muted: 'text-text-muted',
      current: 'text-current',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export interface BaseSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label */
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'muted' | 'current';
}

export function BaseSpinner({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  className,
  ...props
}: BaseSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size, color }), className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ── Convenience: Full-page loader ──
export interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label }: PageLoaderProps) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <BaseSpinner size="lg" label={label} />
    </div>
  );
}
