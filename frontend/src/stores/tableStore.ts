import { create } from 'zustand';
import type { QueryOptions, SortOption, FilterGroup } from '@/types';
import { createEmptyFilter } from '@/core/utils';

/**
 * Per-entity table state (pagination, sort, filter, selection).
 * Mỗi entity tạo 1 slice riêng trong Map.
 */

interface TableSlice {
  page: number;
  limit: number;
  sort: SortOption[];
  filter: FilterGroup;
  search: string;
  selectedIds: Set<string>;
}

function defaultSlice(): TableSlice {
  return {
    page: 1,
    limit: 25,
    sort: [],
    filter: createEmptyFilter(),
    search: '',
    selectedIds: new Set(),
  };
}

interface TableState {
  slices: Record<string, TableSlice>;

  getSlice: (entity: string) => TableSlice;
  setPage: (entity: string, page: number) => void;
  setLimit: (entity: string, limit: number) => void;
  setSort: (entity: string, sort: SortOption[]) => void;
  setFilter: (entity: string, filter: FilterGroup) => void;
  setSearch: (entity: string, search: string) => void;
  toggleSelect: (entity: string, id: string) => void;
  selectAll: (entity: string, ids: string[]) => void;
  clearSelection: (entity: string) => void;
  resetSlice: (entity: string) => void;

  /** Build QueryOptions from slice */
  buildQuery: (entity: string) => QueryOptions;
}

export const useTableStore = create<TableState>((set, get) => {
  const ensure = (entity: string): TableSlice => {
    const existing = get().slices[entity];
    if (existing) return existing;
    const fresh = defaultSlice();
    set((s) => ({ slices: { ...s.slices, [entity]: fresh } }));
    return fresh;
  };

  const update = (entity: string, partial: Partial<TableSlice>) => {
    set((s) => ({
      slices: {
        ...s.slices,
        [entity]: { ...ensure(entity), ...partial },
      },
    }));
  };

  return {
    slices: {},

    getSlice: (entity) => get().slices[entity] ?? defaultSlice(),

    setPage: (entity, page) => update(entity, { page }),
    setLimit: (entity, limit) => update(entity, { limit, page: 1 }),
    setSort: (entity, sort) => update(entity, { sort, page: 1 }),
    setFilter: (entity, filter) => update(entity, { filter, page: 1 }),
    setSearch: (entity, search) => update(entity, { search, page: 1 }),

    toggleSelect: (entity, id) => {
      const slice = ensure(entity);
      const next = new Set(slice.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      update(entity, { selectedIds: next });
    },

    selectAll: (entity, ids) => update(entity, { selectedIds: new Set(ids) }),
    clearSelection: (entity) => update(entity, { selectedIds: new Set() }),
    resetSlice: (entity) =>
      set((s) => ({
        slices: { ...s.slices, [entity]: defaultSlice() },
      })),

    buildQuery: (entity) => {
      const s = ensure(entity);
      return {
        page: s.page,
        limit: s.limit,
        sort: s.sort.length ? s.sort : undefined,
        filter: s.filter.conditions.length ? s.filter : undefined,
        search: s.search || undefined,
      };
    },
  };
});
