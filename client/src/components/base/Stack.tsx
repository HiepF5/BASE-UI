import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// Stack - Vertical layout (flex-col) with consistent gap
// Layout component – no data fetching
// ============================================================

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between children */
  gap?: 0 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  /** Alignment along horizontal axis */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Distribution along vertical axis */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Wrap children when overflowing */
  wrap?: boolean;
  /** Render as a different HTML element */
  as?: React.ElementType;
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export function Stack({
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  as: Component = 'div',
  className,
  children,
  ...props
}: StackProps) {
  return (
    <Component
      className={cn(
        'flex flex-col',
        `gap-${gap}`,
        alignMap[align],
        justifyMap[justify],
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
