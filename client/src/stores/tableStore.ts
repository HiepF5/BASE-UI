import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { FilterGroup, SortOption } from '../types';

// ============================================================
// Table Store - Per-entity table state (filters, sort, pagination)
// Uses a Map keyed by entity name so switching entities doesn't lose state
// Production: immer + devtools middleware
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

export const useTableStore = create<TableStore>()(
  devtools(
    immer((set, get) => {
      /** Helper: return current entity state (never undefined) */
      const active = (): EntityTableState =>
        get().entities[get().activeEntity] ?? { ...DEFAULT_STATE };

      /** Helper: patch the active entity's slice using immer */
      const patch = (updates: Partial<EntityTableState>, actionName?: string) => {
        const key = get().activeEntity;
        set(
          (state) => {
            if (!state.entities[key]) {
              state.entities[key] = { ...DEFAULT_STATE };
            }
            Object.assign(state.entities[key], updates);
          },
          false,
          actionName,
        );
      };

      return {
        activeEntity: '',
        entities: {},

        setActiveEntity: (entity) => {
          set(
            (state) => {
              state.activeEntity = entity;
              if (!state.entities[entity]) {
                state.entities[entity] = { ...DEFAULT_STATE };
              }
            },
            false,
            'setActiveEntity',
          );
        },

        getState: () => active(),

        setPage: (page) => patch({ page }, 'setPage'),
        setLimit: (limit) => patch({ limit, page: 1 }, 'setLimit'),
        setSort: (sort) => patch({ sort }, 'setSort'),
        setFilter: (filter) => patch({ filter, page: 1 }, 'setFilter'),
        setSearch: (search) => patch({ search, page: 1 }, 'setSearch'),
        setSelectedRows: (ids) => patch({ selectedRows: ids }, 'setSelectedRows'),
        toggleRow: (id) => {
          const current = active();
          patch(
            {
              selectedRows: current.selectedRows.includes(id)
                ? current.selectedRows.filter((r) => r !== id)
                : [...current.selectedRows, id],
            },
            'toggleRow',
          );
        },
        clearSelection: () => patch({ selectedRows: [] }, 'clearSelection'),
        reset: () => patch({ ...DEFAULT_STATE }, 'reset'),
      };
    }),
    {
      name: 'TableStore',
      enabled: import.meta.env.DEV,
    },
  ),
);
