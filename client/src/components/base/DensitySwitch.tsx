import React from 'react';
import { cn } from '../../core/utils';

// ============================================================
// DensitySwitch - Toggle table density (compact/normal/spacious)
// Segmented control pattern – pure presentational
// ============================================================

export type TableDensity = 'compact' | 'normal' | 'spacious';

export interface DensitySwitchProps {
  /** Current density */
  value: TableDensity;
  /** Change callback */
  onChange: (density: TableDensity) => void;
  /** Custom class */
  className?: string;
}

const densityOptions: Array<{ value: TableDensity; label: string; icon: React.ReactNode }> = [
  {
    value: 'compact',
    label: 'Compact',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    value: 'normal',
    label: 'Normal',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    value: 'spacious',
    label: 'Spacious',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h16" />
      </svg>
    ),
  },
];

export function DensitySwitch({ value, onChange, className }: DensitySwitchProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-border bg-bg-secondary p-0.5',
        className,
      )}
      role="radiogroup"
      aria-label="Table density"
    >
      {densityOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all',
            value === option.value
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

DensitySwitch.displayName = 'DensitySwitch';
