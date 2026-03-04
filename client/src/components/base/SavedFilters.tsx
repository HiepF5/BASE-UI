import React, { useState, useRef, useEffect } from 'react';
import { BaseButton } from './BaseButton';
import { cn } from '../../core/utils';
import type { FilterGroup } from '../../types';

// ============================================================
// SavedFilters - Save/Load named filter presets
// Uses localStorage for persistence
// Pure UI component – filter logic managed by parent
// ============================================================

export interface SavedFilter {
  id: string;
  name: string;
  filter: FilterGroup;
  createdAt: string;
}

export interface SavedFiltersProps {
  /** Entity name for localStorage key */
  entityName: string;
  /** Current active filter */
  currentFilter: FilterGroup | null;
  /** Callback when a saved filter is applied */
  onApply: (filter: FilterGroup) => void;
  /** Custom class */
  className?: string;
}

const STORAGE_PREFIX = 'base-ui-saved-filters-';

function getStoredFilters(entityName: string): SavedFilter[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + entityName);
    return raw ? (JSON.parse(raw) as SavedFilter[]) : [];
  } catch {
    return [];
  }
}

function setStoredFilters(entityName: string, filters: SavedFilter[]): void {
  localStorage.setItem(STORAGE_PREFIX + entityName, JSON.stringify(filters));
}

export function SavedFilters({ entityName, currentFilter, onApply, className }: SavedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<SavedFilter[]>(() => getStoredFilters(entityName));
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSaveInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSave = () => {
    if (!saveName.trim() || !currentFilter) return;
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveName.trim(),
      filter: currentFilter,
      createdAt: new Date().toISOString(),
    };
    const updated = [...filters, newFilter];
    setFilters(updated);
    setStoredFilters(entityName, updated);
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleDelete = (id: string) => {
    const updated = filters.filter((f) => f.id !== id);
    setFilters(updated);
    setStoredFilters(entityName, updated);
  };

  const handleApply = (filter: SavedFilter) => {
    onApply(filter.filter);
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <BaseButton variant="outline" size="sm" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Saved Filters
          {filters.length > 0 && (
            <span className="text-xs bg-primary-100 text-primary-700 px-1.5 rounded-full">
              {filters.length}
            </span>
          )}
        </span>
      </BaseButton>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-white border border-border rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Saved Filters</span>
            {currentFilter && (
              <button
                onClick={() => setShowSaveInput(!showSaveInput)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                + Save Current
              </button>
            )}
          </div>

          {/* Save input */}
          {showSaveInput && (
            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Filter name..."
                className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <BaseButton
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={!saveName.trim()}
              >
                Save
              </BaseButton>
            </div>
          )}

          {/* Filter list */}
          <div className="max-h-48 overflow-y-auto">
            {filters.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-text-muted">
                No saved filters yet.
                {currentFilter
                  ? ' Click "Save Current" to save the active filter.'
                  : ' Apply a filter first, then save it.'}
              </div>
            ) : (
              filters.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary group transition-colors"
                >
                  <button
                    onClick={() => handleApply(f)}
                    className="flex-1 text-left text-sm text-text-primary hover:text-primary-600"
                  >
                    {f.name}
                  </button>
                  <span className="text-xs text-text-muted">
                    {f.filter.conditions.length} cond.
                  </span>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error text-xs transition-opacity"
                    aria-label={`Delete filter ${f.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

SavedFilters.displayName = 'SavedFilters';
