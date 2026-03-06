import type { SavedFilter } from '../types/example-app.types';
import { SAVED_FILTERS_KEY } from '../config/example-app.config';

// ============================================================
// saved-filter.service.ts
// Service for managing saved filters in localStorage
// ============================================================

/**
 * Load saved filters from localStorage
 */
export function loadSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(SAVED_FILTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist saved filters to localStorage
 */
export function persistSavedFilters(filters: SavedFilter[]): void {
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

/**
 * Add a new saved filter
 */
export function addSavedFilter(filters: SavedFilter[], newFilter: SavedFilter): SavedFilter[] {
  const updated = [...filters, newFilter];
  persistSavedFilters(updated);
  return updated;
}

/**
 * Delete a saved filter by ID
 */
export function deleteSavedFilter(filters: SavedFilter[], filterId: string): SavedFilter[] {
  const updated = filters.filter((f) => f.id !== filterId);
  persistSavedFilters(updated);
  return updated;
}

/**
 * Get saved filters for a specific entity
 */
export function getEntitySavedFilters(filters: SavedFilter[], entity: string): SavedFilter[] {
  return filters.filter((f) => f.entity === entity);
}
