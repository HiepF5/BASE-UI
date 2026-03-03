import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../core/utils';

// ============================================================
// Container - Centered content wrapper with max-width
// Layout component – no data fetching
// ============================================================

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  /** Render as a different element */
  as?: React.ElementType;
  /** Remove horizontal padding */
  noPadding?: boolean;
}

export function Container({
  size,
  as: Component = 'div',
  noPadding,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(containerVariants({ size }), noPadding && 'px-0 sm:px-0 lg:px-0', className)}
      {...props}
    >
      {children}
    </Component>
  );
}
