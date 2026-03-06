import { useState, useCallback, useMemo, useEffect } from 'react';
import { schemaRegistry } from '../../../config/schema.config';
import {
  createEmptyGroup,
  resolveQueryFields,
  countConditions,
  astToFlatFilter,
  astToSQLPreview,
  type FilterGroupNode,
  type QueryField,
} from '../../../core/query-builder';
import type { SortOption, FilterGroup } from '../../../types';
import toast from 'react-hot-toast';
import { logger } from '../../../core/utils';
import type { SavedFilter } from '../types/example-app.types';
import { DEFAULT_MOCK_DATA_COUNT } from '../config/example-app.config';
import { generateMockData, generateRelationOptions } from '../utils/example-app.helper';
import {
  loadSavedFilters,
  addSavedFilter,
  deleteSavedFilter,
  getEntitySavedFilters,
} from '../services/saved-filter.service';

// ============================================================
// useExampleApp - Main orchestrator hook
// Manages all state and logic for the example app
// ============================================================

export function useExampleApp() {
  // ─── Entity State ───────────────────────────────────────
  const [activeEntity, setActiveEntity] = useState('users');
  const schema = schemaRegistry[activeEntity];

  // ─── Pagination State ───────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(schema?.defaultPageSize ?? 20);

  // ─── Sort State ─────────────────────────────────────────
  const [sort, setSort] = useState<SortOption[]>(schema?.defaultSort ? [schema.defaultSort] : []);

  // ─── Filter State ───────────────────────────────────────
  const [filterAST, setFilterAST] = useState<FilterGroupNode>(createEmptyGroup('AND'));
  const [appliedFilter, setAppliedFilter] = useState<FilterGroup | null>(null);

  // ─── Saved Filters ──────────────────────────────────────
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(loadSavedFilters);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // ─── Search ─────────────────────────────────────────────
  const [search, setSearch] = useState('');

  // ─── Selection ──────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // ─── Modal States ───────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [deleteRow, setDeleteRow] = useState<Record<string, unknown> | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // ─── Mock Data ──────────────────────────────────────────
  const allData = useMemo(
    () => (schema ? generateMockData(schema, DEFAULT_MOCK_DATA_COUNT) : []),
    [schema],
  );

  // ─── Query Fields ───────────────────────────────────────
  const queryFields = useMemo<QueryField[]>(
    () => (schema ? resolveQueryFields(schema, schemaRegistry, 2) : []),
    [schema],
  );

  // ─── Relation Options ───────────────────────────────────
  const relationOptions = useMemo(
    () => (schema ? generateRelationOptions(schema, schemaRegistry) : {}),
    [schema],
  );

  // ─── Filtered Data (client-side) ────────────────────────
  const filteredData = useMemo(() => {
    let result = [...allData];

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(lowerSearch),
        ),
      );
    }

    // Sort
    if (sort.length > 0) {
      const { field, direction } = sort[0];
      result.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [allData, search, sort]);

  const total = filteredData.length;
  const paginatedData = useMemo(
    () => filteredData.slice((page - 1) * limit, page * limit),
    [filteredData, page, limit],
  );

  // ─── Entity Saved Filters ───────────────────────────────
  const entitySavedFilters = useMemo(
    () => getEntitySavedFilters(savedFilters, activeEntity),
    [savedFilters, activeEntity],
  );

  // ─── SQL Preview ────────────────────────────────────────
  const sqlPreview = useMemo(() => astToSQLPreview(filterAST), [filterAST]);
  const conditionCount = useMemo(() => countConditions(filterAST), [filterAST]);

  // ─── Reset on Entity Change ─────────────────────────────
  useEffect(() => {
    setPage(1);
    setSearch('');
    setFilterAST(createEmptyGroup('AND'));
    setAppliedFilter(null);
    setSelectedRows([]);
    setSort(schema?.defaultSort ? [schema.defaultSort] : []);
    setLimit(schema?.defaultPageSize ?? 20);
  }, [activeEntity, schema]);

  // ─── Filter Handlers ────────────────────────────────────
  const handleApplyFilter = useCallback(() => {
    if (countConditions(filterAST) === 0) {
      setAppliedFilter(null);
    } else {
      const flat = astToFlatFilter(filterAST);
      setAppliedFilter(flat);
    }
    setPage(1);
    toast.success(
      countConditions(filterAST) > 0
        ? `Filter applied: ${countConditions(filterAST)} conditions`
        : 'Filter cleared',
    );
  }, [filterAST]);

  const handleClearFilter = useCallback(() => {
    setFilterAST(createEmptyGroup('AND'));
    setAppliedFilter(null);
    setPage(1);
  }, []);

  const handleSaveFilter = useCallback(() => {
    if (!filterName.trim()) return;
    const newFilter: SavedFilter = {
      id: Date.now().toString(36),
      name: filterName.trim(),
      entity: activeEntity,
      filter: filterAST,
      createdAt: new Date().toISOString(),
    };
    const updated = addSavedFilter(savedFilters, newFilter);
    setSavedFilters(updated);
    setFilterName('');
    setShowSaveDialog(false);
    toast.success(`Filter "${newFilter.name}" saved`);
  }, [filterName, filterAST, activeEntity, savedFilters]);

  const handleLoadFilter = useCallback((saved: SavedFilter) => {
    setFilterAST(saved.filter);
    const flat = astToFlatFilter(saved.filter);
    setAppliedFilter(countConditions(saved.filter) > 0 ? flat : null);
    setPage(1);
    toast.success(`Loaded filter: ${saved.name}`);
  }, []);

  const handleDeleteSavedFilter = useCallback(
    (id: string) => {
      const updated = deleteSavedFilter(savedFilters, id);
      setSavedFilters(updated);
      toast.success('Filter deleted');
    },
    [savedFilters],
  );

  // ─── CRUD Handlers ──────────────────────────────────────
  const handleCreate = useCallback(
    (data: Record<string, unknown>) => {
      toast.success(`${schema?.label ?? 'Record'} created (mock)`);
      setCreateOpen(false);
      logger.info('[ExampleApp] Create:', data);
    },
    [schema],
  );

  const handleEdit = useCallback(
    (data: Record<string, unknown>) => {
      toast.success(`${schema?.label ?? 'Record'} updated (mock)`);
      setEditingRow(null);
      logger.info('[ExampleApp] Edit:', data);
    },
    [schema],
  );

  const handleDelete = useCallback(() => {
    toast.success(`${schema?.label ?? 'Record'} deleted (mock)`);
    setDeleteRow(null);
  }, [schema]);

  // ─── Search Handler ─────────────────────────────────────
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // ─── Limit Handler ──────────────────────────────────────
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return {
    // Entity
    activeEntity,
    setActiveEntity,
    schema,

    // Pagination
    page,
    setPage,
    limit,
    setLimit: handleLimitChange,

    // Sort
    sort,
    setSort,

    // Filter
    filterAST,
    setFilterAST,
    appliedFilter,
    queryFields,
    conditionCount,
    sqlPreview,

    // Saved Filters
    savedFilters,
    entitySavedFilters,
    showSaveDialog,
    setShowSaveDialog,
    filterName,
    setFilterName,

    // Search
    search,
    setSearch: handleSearch,

    // Selection
    selectedRows,
    setSelectedRows,

    // Modals
    createOpen,
    setCreateOpen,
    editingRow,
    setEditingRow,
    deleteRow,
    setDeleteRow,
    showConfig,
    setShowConfig,
    showFilterPanel,
    setShowFilterPanel,

    // Data
    allData,
    paginatedData,
    total,
    relationOptions,

    // Handlers
    handleApplyFilter,
    handleClearFilter,
    handleSaveFilter,
    handleLoadFilter,
    handleDeleteSavedFilter,
    handleCreate,
    handleEdit,
    handleDelete,
  };
}
