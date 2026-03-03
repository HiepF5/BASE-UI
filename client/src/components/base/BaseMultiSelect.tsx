import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../core/utils';

// ============================================================
// BaseMultiSelect - Multi-option select with tags
// Pure presentational
// ============================================================

export interface MultiSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface BaseMultiSelectProps {
  options: MultiSelectOption[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function BaseMultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  error,
  hint,
  disabled,
  required,
  searchable = true,
  maxDisplay = 3,
  className,
}: BaseMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const filtered = options.filter(
    (opt) => !search || opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleOption = useCallback(
    (optValue: string | number) => {
      if (value.includes(optValue)) {
        onChange(value.filter((v) => v !== optValue));
      } else {
        onChange([...value, optValue]);
      }
    },
    [value, onChange],
  );

  const removeTag = (optValue: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'flex min-h-[2.5rem] w-full flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5 text-left text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-danger'
            : open
              ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1'
              : 'border-border hover:border-border-hover',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value.length === 0 && <span className="text-text-muted">{placeholder}</span>}

        {selectedLabels.slice(0, maxDisplay).map((lbl, i) => (
          <span
            key={value[i]}
            className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700"
          >
            {lbl}
            <svg
              className="h-3 w-3 cursor-pointer hover:text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              onClick={(e) => removeTag(value[i], e)}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        ))}

        {selectedLabels.length > maxDisplay && (
          <span className="text-xs text-text-muted">
            +{selectedLabels.length - maxDisplay} more
          </span>
        )}

        {/* Chevron */}
        <svg
          className={cn(
            'ml-auto h-4 w-4 shrink-0 text-text-muted transition-transform',
            open && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="relative z-dropdown">
          <div className="absolute top-0 left-0 w-full rounded-md border border-border bg-bg-elevated shadow-dropdown animate-scale-in">
            {searchable && (
              <div className="border-b border-border p-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded border-0 bg-transparent px-2 py-1 text-sm text-text placeholder:text-text-muted focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            <ul className="max-h-60 overflow-auto p-1" role="listbox" aria-multiselectable="true">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-text-muted">No options found</li>
              )}

              {filtered.map((opt) => {
                const selected = value.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={selected}
                    onClick={() => !opt.disabled && toggleOption(opt.value)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
                      selected
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-bg-tertiary text-text',
                      opt.disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        selected ? 'border-primary bg-primary text-text-inverse' : 'border-border',
                      )}
                    >
                      {selected && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
