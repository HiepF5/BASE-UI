import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// Grid - CSS Grid layout component
// Layout component – no data fetching
// ============================================================

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (1-12) or 'auto' for auto-fit */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';
  /** Responsive: columns at sm breakpoint */
  smCols?: 1 | 2 | 3 | 4 | 6;
  /** Responsive: columns at md breakpoint */
  mdCols?: 1 | 2 | 3 | 4 | 6;
  /** Responsive: columns at lg breakpoint */
  lgCols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Gap between items */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  /** Horizontal gap only */
  gapX?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  /** Vertical gap only */
  gapY?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  /** Render as a different HTML element */
  as?: React.ElementType;
}

const colsMap: Record<string | number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
  auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
};

const smColsMap: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  6: 'sm:grid-cols-6',
};

const mdColsMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  6: 'md:grid-cols-6',
};

const lgColsMap: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

export function Grid({
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  gap = 4,
  gapX,
  gapY,
  as: Component = 'div',
  className,
  children,
  ...props
}: GridProps) {
  return (
    <Component
      className={cn(
        'grid',
        colsMap[cols],
        smCols && smColsMap[smCols],
        mdCols && mdColsMap[mdCols],
        lgCols && lgColsMap[lgCols],
        gapX != null ? `gap-x-${gapX}` : null,
        gapY != null ? `gap-y-${gapY}` : null,
        gapX == null && gapY == null ? `gap-${gap}` : null,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
