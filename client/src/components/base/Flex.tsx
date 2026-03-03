import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// Flex - Horizontal flex layout with consistent gap
// Layout component – no data fetching
// ============================================================

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between children */
  gap?: 0 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  /** Alignment along cross axis */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Distribution along main axis */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Direction */
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  /** Wrap children */
  wrap?: boolean | 'reverse';
  /** Render as a different HTML element */
  as?: React.ElementType;
  /** Make it inline-flex */
  inline?: boolean;
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const directionMap = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

export function Flex({
  gap = 2,
  align = 'center',
  justify = 'start',
  direction = 'row',
  wrap = false,
  as: Component = 'div',
  inline = false,
  className,
  children,
  ...props
}: FlexProps) {
  return (
    <Component
      className={cn(
        inline ? 'inline-flex' : 'flex',
        directionMap[direction],
        `gap-${gap}`,
        alignMap[align],
        justifyMap[justify],
        wrap === true ? 'flex-wrap' : wrap === 'reverse' ? 'flex-wrap-reverse' : '',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
