import { create } from 'zustand';
import type { FilterGroup, SortOption } from '../types';

// ============================================================
// Table Store - Per-entity table state (filters, sort, pagination)
// Uses a Map keyed by entity name so switching entities doesn't lose state
// ============================================================

interface EntityTableState {
  page: number;
  limit: number;
  sort: SortOption[];
  filter: FilterGroup | null;
  search: string;
  selectedRows: string[];
}

const DEFAULT_STATE: EntityTableState = {
  page: 1,
  limit: 20,
  sort: [],
  filter: null,
  search: '',
  selectedRows: [],
};

interface TableStore {
  /** Active entity key */
  activeEntity: string;
  /** Per-entity state map */
  entities: Record<string, EntityTableState>;

  /** Switch active entity (creates default state if first visit) */
  setActiveEntity: (entity: string) => void;
  /** Get state for the active entity */
  getState: () => EntityTableState;

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

export const useTableStore = create<TableStore>((set, get) => {
  /** Helper: return current entity state (never undefined) */
  const active = (): EntityTableState => get().entities[get().activeEntity] ?? { ...DEFAULT_STATE };

  /** Helper: patch the active entity's slice */
  const patch = (updates: Partial<EntityTableState>) => {
    const key = get().activeEntity;
    set((s) => ({
      entities: {
        ...s.entities,
        [key]: { ...active(), ...updates },
      },
    }));
  };

  return {
    activeEntity: '',
    entities: {},

    setActiveEntity: (entity) => {
      set((s) => ({
        activeEntity: entity,
        entities: s.entities[entity]
          ? s.entities
          : { ...s.entities, [entity]: { ...DEFAULT_STATE } },
      }));
    },

    getState: () => active(),

    setPage: (page) => patch({ page }),
    setLimit: (limit) => patch({ limit, page: 1 }),
    setSort: (sort) => patch({ sort }),
    setFilter: (filter) => patch({ filter, page: 1 }),
    setSearch: (search) => patch({ search, page: 1 }),
    setSelectedRows: (ids) => patch({ selectedRows: ids }),
    toggleRow: (id) => {
      const current = active();
      patch({
        selectedRows: current.selectedRows.includes(id)
          ? current.selectedRows.filter((r) => r !== id)
          : [...current.selectedRows, id],
      });
    },
    clearSelection: () => patch({ selectedRows: [] }),
    reset: () => patch({ ...DEFAULT_STATE }),
  };
});
