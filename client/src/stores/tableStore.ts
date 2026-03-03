import { create } from 'zustand';
import type { FilterGroup, SortOption } from '../types';

// ============================================================
// Table Store - Filters, sort, pagination per entity
// ============================================================
interface TableState {
  page: number;
  limit: number;
  sort: SortOption[];
  filter: FilterGroup | null;
  search: string;
  selectedRows: string[];

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sort: SortOption[]) => void;
  setFilter: (filter: FilterGroup | null) => void;
  setSearch: (search: string) => void;
  setSelectedRows: (ids: string[]) => void;
  toggleRow: (id: string) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const useTableStore = create<TableState>((set) => ({
  page: 1,
  limit: 20,
  sort: [],
  filter: null,
  search: '',
  selectedRows: [],

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  setSort: (sort) => set({ sort }),
  setFilter: (filter) => set({ filter, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setSelectedRows: (ids) => set({ selectedRows: ids }),
  toggleRow: (id) =>
    set((s) => ({
      selectedRows: s.selectedRows.includes(id)
        ? s.selectedRows.filter((r) => r !== id)
        : [...s.selectedRows, id],
    })),
  clearSelection: () => set({ selectedRows: [] }),
  reset: () =>
    set({
      page: 1,
      limit: 20,
      sort: [],
      filter: null,
      search: '',
      selectedRows: [],
    }),
}));
