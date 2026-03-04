import { useCallback, useEffect, useMemo } from 'react';
import { useCrud, type UseCrudReturn } from './useCrud';
import { useEntitySchema, useRelationOptions } from './useEntitySchema';
import { useTableStore } from '../stores/tableStore';
import type { EntitySchema } from '../core/metadata/schema.types';
import type { SortOption, FilterGroup } from '../types';

// ============================================================
// useCrudEngine - Full CRUD orchestrator hook
// Combines: EntitySchema + CRUD ops + Relation options + Table state
// This is the "one hook to rule them all" for any entity page
// Pattern: React Query (server) + Zustand (UI) + Metadata (schema)
// ============================================================

/** Options for the CRUD engine */
export interface UseCrudEngineOptions {
  /** Connection ID (default: 'default') */
  connectionId?: string;
  /** Use only static schema config (no API fetch) */
  staticOnly?: boolean;
  /** Override page size */
  pageSize?: number;
  /** Default sort override */
  defaultSort?: SortOption[];
  /** Relations to include in list query */
  include?: string[];
}

/** Return type for useCrudEngine */
export interface UseCrudEngineReturn<T = Record<string, unknown>> {
  // ─── Schema ─────────────
  /** Resolved entity schema */
  schema: EntitySchema | null;
  /** Is schema loading */
  schemaLoading: boolean;
  /** Schema error */
  schemaError: Error | null;
  /** Whether schema is from static config */
  isStaticSchema: boolean;

  // ─── CRUD operations ────
  crud: UseCrudReturn<T>;

  // ─── Relation data ──────
  /** { fieldName: options[] } for select/multiselect relation fields */
  relationOptions: Record<string, Array<{ label: string; value: string | number }>>;
  /** { fieldName: boolean } loading states */
  relationLoading: Record<string, boolean>;

  // ─── Table state ────────
  /** Current page */
  page: number;
  /** Current page size */
  limit: number;
  /** Current sort */
  sort: SortOption[];
  /** Current filter */
  filter: FilterGroup | null;
  /** Current search text */
  search: string;
  /** Selected row IDs */
  selectedRows: string[];

  // ─── Table actions ──────
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sort: SortOption[]) => void;
  setFilter: (filter: FilterGroup | null) => void;
  setSearch: (search: string) => void;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  resetTable: () => void;

  // ─── Computed ───────────
  /** Entity label (from schema) */
  entityLabel: string;
  /** Whether entity has create permission */
  canCreate: boolean;
  /** Whether entity has update permission */
  canUpdate: boolean;
  /** Whether entity has delete permission */
  canDelete: boolean;
  /** Whether entity has export permission */
  canExport: boolean;
}

export function useCrudEngine<T = Record<string, unknown>>(
  entity: string,
  options?: UseCrudEngineOptions,
): UseCrudEngineReturn<T> {
  const connectionId = options?.connectionId ?? 'default';

  // ─── 1. Entity Schema ───────────────────────────────────
  const {
    schema,
    isLoading: schemaLoading,
    error: schemaError,
    isStatic: isStaticSchema,
  } = useEntitySchema(connectionId, entity, {
    staticOnly: options?.staticOnly,
  });

  // ─── 2. Table State (Zustand) ───────────────────────────
  const tableStore = useTableStore();

  // Set active entity on mount
  useEffect(() => {
    if (entity) tableStore.setActiveEntity(entity);
  }, [entity]); // eslint-disable-line react-hooks/exhaustive-deps

  const entityState = tableStore.getState();

  // Apply default sort from schema if no sort is set
  useEffect(() => {
    if (schema?.defaultSort && entityState.sort.length === 0) {
      tableStore.setSort([schema.defaultSort]);
    }
    if (schema?.defaultPageSize && entityState.limit === 20) {
      tableStore.setLimit(schema.defaultPageSize);
    }
  }, [schema]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 3. CRUD operations (React Query) ───────────────────
  const crud = useCrud<T>(connectionId, entity, {
    page: entityState.page,
    limit: options?.pageSize ?? entityState.limit,
    sort: options?.defaultSort ?? entityState.sort,
    filter: entityState.filter ?? undefined,
    search: entityState.search || undefined,
    include: options?.include,
  });

  // ─── 4. Relation options ────────────────────────────────
  const fields = schema?.fields ?? [];
  const { optionsMap, loadingMap } = useRelationOptions(connectionId, fields);

  // ─── Computed permissions ───────────────────────────────
  const permissions = schema?.permissions;
  const canCreate = permissions?.create !== false;
  const canUpdate = permissions?.update !== false;
  const canDelete = permissions?.delete !== false;
  const canExport = permissions?.export === true;

  // ─── Table action wrappers ──────────────────────────────
  const setPage = useCallback((p: number) => tableStore.setPage(p), [tableStore]);
  const setLimit = useCallback((l: number) => tableStore.setLimit(l), [tableStore]);
  const setSort = useCallback((s: SortOption[]) => tableStore.setSort(s), [tableStore]);
  const setFilter = useCallback((f: FilterGroup | null) => tableStore.setFilter(f), [tableStore]);
  const setSearch = useCallback((s: string) => tableStore.setSearch(s), [tableStore]);
  const setSelectedRows = useCallback(
    (ids: string[]) => tableStore.setSelectedRows(ids),
    [tableStore],
  );
  const clearSelection = useCallback(() => tableStore.clearSelection(), [tableStore]);
  const resetTable = useCallback(() => tableStore.reset(), [tableStore]);

  const entityLabel = useMemo(
    () => schema?.label || entity.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    [schema, entity],
  );

  return {
    // Schema
    schema,
    schemaLoading,
    schemaError,
    isStaticSchema,

    // CRUD operations
    crud,

    // Relation data
    relationOptions: optionsMap,
    relationLoading: loadingMap,

    // Table state
    page: entityState.page,
    limit: entityState.limit,
    sort: entityState.sort,
    filter: entityState.filter,
    search: entityState.search,
    selectedRows: entityState.selectedRows,

    // Table actions
    setPage,
    setLimit,
    setSort,
    setFilter,
    setSearch,
    setSelectedRows,
    clearSelection,
    resetTable,

    // Computed
    entityLabel,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
  };
}
