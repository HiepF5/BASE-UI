import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchRelationOptions } from '../../core/api/crudService';
import { queryKeys } from '../../core/query';
import { cn } from '../../core/utils';

// ============================================================
// RelationMultiSelect – Async searchable multi-select for ManyToMany
// Features: preloaded options, async search, selected chips,
//           keyboard nav, add/remove associations
// Pure presentational + async search data fetch
// ============================================================

export interface RelationMultiSelectProps {
  /** Field label */
  label: string;
  /** Selected values (FK ids) */
  value: Array<string | number>;
  /** On change (FK ids) */
  onChange: (value: Array<string | number>) => void;
  /** Preloaded options */
  options: Array<{ label: string; value: string | number }>;
  /** Loading options */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Required */
  required?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Target entity for async search */
  targetEntity?: string;
  /** Display field on target */
  displayField?: string;
  /** Connection ID */
  connectionId?: string;
  /** Max selections */
  max?: number;
}

export function RelationMultiSelect({
  label,
  value = [],
  onChange,
  options: preloadedOptions,
  loading = false,
  error,
  hint,
  required,
  disabled,
  placeholder = 'Search to add...',
  targetEntity,
  displayField = 'name',
  connectionId = 'default',
  max,
}: RelationMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // Async search
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: [...queryKeys.relation.search(connectionId, targetEntity ?? '', debouncedSearch)],
    queryFn: () =>
      searchRelationOptions(connectionId, targetEntity!, displayField, debouncedSearch),
    enabled: Boolean(targetEntity) && debouncedSearch.length >= 2 && isOpen,
    staleTime: 60_000,
  });

  // Available options (exclude already selected)
  const availableOptions = useMemo(() => {
    const selectedSet = new Set(value.map(String));
    const source =
      debouncedSearch.length >= 2 && searchResults
        ? searchResults
        : searchTerm
          ? preloadedOptions.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
          : preloadedOptions;
    return source.filter((o) => !selectedSet.has(String(o.value)));
  }, [preloadedOptions, searchResults, debouncedSearch, searchTerm, value]);

  // Selected labels
  const selectedItems = useMemo(() => {
    return value.map((v) => {
      const found = preloadedOptions.find((o) => String(o.value) === String(v));
      return { value: v, label: found?.label ?? String(v) };
    });
  }, [value, preloadedOptions]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAdd = useCallback(
    (optValue: string | number) => {
      if (max && value.length >= max) return;
      onChange([...value, optValue]);
      setSearchTerm('');
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [value, onChange, max],
  );

  const handleRemove = useCallback(
    (optValue: string | number) => {
      onChange(value.filter((v) => String(v) !== String(optValue)));
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !searchTerm && value.length > 0) {
        // Remove last chip
        onChange(value.slice(0, -1));
        return;
      }

      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < availableOptions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : availableOptions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && availableOptions[highlightedIndex]) {
            handleAdd(availableOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    },
    [isOpen, highlightedIndex, availableOptions, handleAdd, searchTerm, value, onChange],
  );

  // Scroll highlighted
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        (items[highlightedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const isSearching = loading || searching;
  const atMax = max ? value.length >= max : false;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
        {max && (
          <span className="text-text-muted font-normal ml-1">
            ({value.length}/{max})
          </span>
        )}
      </label>

      <div className="relative">
        {/* Input area with chips */}
        <div
          className={cn(
            'w-full flex flex-wrap items-center gap-1 border rounded-md bg-bg text-sm px-2 py-1.5 min-h-[38px] transition-colors cursor-text',
            'focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-primary-500 focus-within:border-primary-500',
            disabled && 'opacity-50 cursor-not-allowed bg-bg-tertiary',
            error
              ? 'border-danger focus-within:ring-danger'
              : 'border-border hover:border-border-hover',
          )}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          {/* Chips */}
          {selectedItems.map((item) => (
            <span
              key={`${item.value}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800"
            >
              {item.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.value);
                  }}
                  className="hover:text-primary-900"
                  tabIndex={-1}
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </span>
          ))}

          {/* Search input */}
          {!atMax && !disabled && (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 min-w-[80px] px-1 py-0.5 bg-transparent outline-none text-text placeholder:text-text-muted text-sm"
              placeholder={value.length === 0 ? placeholder : ''}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
                if (!isOpen) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
            />
          )}

          {isSearching && (
            <svg
              className="animate-spin h-4 w-4 text-text-muted shrink-0"
              viewBox="0 0 24 24"
              fill="none"
            >
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
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-bg shadow-lg"
          >
            {availableOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-text-muted text-center">
                {isSearching
                  ? 'Searching...'
                  : atMax
                    ? 'Max selections reached'
                    : searchTerm
                      ? 'No results found'
                      : 'No options available'}
              </li>
            ) : (
              availableOptions.map((opt, idx) => (
                <li
                  key={`${opt.value}`}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors',
                    highlightedIndex === idx
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-bg-secondary',
                  )}
                  onClick={() => handleAdd(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

RelationMultiSelect.displayName = 'RelationMultiSelect';
