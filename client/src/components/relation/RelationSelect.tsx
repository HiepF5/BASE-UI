import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchRelationOptions } from '../../core/api/crudService';
import { queryKeys } from '../../core/query';
import { cn } from '../../core/utils';

// ============================================================
// RelationSelect – Async searchable dropdown for ManyToOne / OneToOne
// Features: preloaded options, debounced search, keyboard navigation,
//           display selected relation name, "create new" (optional)
// Pure presentational + data fetch (async search)
// ============================================================

export interface RelationSelectProps {
  /** Field label */
  label: string;
  /** Selected value (FK id) */
  value: string | number | null | undefined;
  /** On change (FK id) */
  onChange: (value: string | number | null) => void;
  /** Preloaded options from parent */
  options: Array<{ label: string; value: string | number }>;
  /** Is options loading */
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
  /** Connection ID for search */
  connectionId?: string;
  /** Allow creating new record inline */
  allowCreate?: boolean;
  /** Callback when "Create new" is clicked */
  onCreateNew?: () => void;
}

export function RelationSelect({
  label,
  value,
  onChange,
  options: preloadedOptions,
  loading = false,
  error,
  hint,
  required,
  disabled,
  placeholder = 'Search or select...',
  targetEntity,
  displayField = 'name',
  connectionId = 'default',
  allowCreate,
  onCreateNew,
}: RelationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // Async search query
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: [...queryKeys.relation.search(connectionId, targetEntity ?? '', debouncedSearch)],
    queryFn: () =>
      searchRelationOptions(connectionId, targetEntity!, displayField, debouncedSearch),
    enabled: Boolean(targetEntity) && debouncedSearch.length >= 2 && isOpen,
    staleTime: 60_000,
  });

  // Merge options: search results take priority when searching
  const displayOptions = useMemo(() => {
    if (debouncedSearch.length >= 2 && searchResults) {
      return searchResults;
    }
    // Filter preloaded by search term
    if (searchTerm) {
      return preloadedOptions.filter((o) =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return preloadedOptions;
  }, [preloadedOptions, searchResults, debouncedSearch, searchTerm]);

  // Get selected display label
  const selectedLabel = useMemo(() => {
    if (value === null || value === undefined) return '';
    const found = preloadedOptions.find((o) => String(o.value) === String(value));
    if (found) return found.label;
    const fromSearch = searchResults?.find((o) => String(o.value) === String(value));
    return fromSearch?.label ?? String(value);
  }, [value, preloadedOptions, searchResults]);

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

  const handleSelect = useCallback(
    (optValue: string | number) => {
      onChange(optValue);
      setIsOpen(false);
      setSearchTerm('');
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setSearchTerm('');
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
          setHighlightedIndex((prev) => (prev < displayOptions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : displayOptions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && displayOptions[highlightedIndex]) {
            handleSelect(displayOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    },
    [isOpen, highlightedIndex, displayOptions, handleSelect],
  );

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        (items[highlightedIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  const isSearching = loading || searching;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {/* Trigger / input */}
      <div className="relative">
        <div
          className={cn(
            'w-full flex items-center border rounded-md bg-bg text-sm transition-colors cursor-pointer',
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
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 bg-transparent outline-none text-text placeholder:text-text-muted"
              placeholder={selectedLabel || placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              autoFocus
            />
          ) : (
            <span
              className={cn(
                'flex-1 px-3 py-2 truncate',
                selectedLabel ? 'text-text' : 'text-text-muted',
              )}
            >
              {selectedLabel || placeholder}
            </span>
          )}

          <div className="flex items-center gap-1 pr-2">
            {isSearching && (
              <svg className="animate-spin h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none">
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
            {value !== null && value !== undefined && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-text-muted hover:text-text p-0.5 rounded"
                tabIndex={-1}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <svg
              className={cn('h-4 w-4 text-text-muted transition-transform', isOpen && 'rotate-180')}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-bg shadow-lg"
          >
            {displayOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-text-muted text-center">
                {isSearching
                  ? 'Searching...'
                  : searchTerm
                    ? 'No results found'
                    : 'No options available'}
              </li>
            ) : (
              displayOptions.map((opt, idx) => (
                <li
                  key={`${opt.value}`}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors',
                    highlightedIndex === idx && 'bg-primary-50 text-primary-700',
                    String(opt.value) === String(value) &&
                      'bg-primary-100 text-primary-800 font-medium',
                    highlightedIndex !== idx &&
                      String(opt.value) !== String(value) &&
                      'hover:bg-bg-secondary',
                  )}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {opt.label}
                </li>
              ))
            )}

            {/* Create new option */}
            {allowCreate && onCreateNew && (
              <li
                className="px-3 py-2 text-sm cursor-pointer border-t border-border text-primary-600 hover:bg-primary-50 font-medium"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
              >
                + Create new
              </li>
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

RelationSelect.displayName = 'RelationSelect';
