import React, { useMemo } from 'react';
import { DynamicTable } from '../../../components/dynamic';
import { BaseFilterBar, BaseButton } from '../../../components/base';
import { entitySchemaToColumnConfigs } from '../../../core/metadata';
import type { DynamicListViewProps } from '../types/dynamic-crud.types';

// ============================================================
// DynamicListView - Metadata-driven list view
// Header + filter bar + DynamicTable + pagination
// Pure presentational – receives all data from parent
// ============================================================

export function DynamicListView({
  schema,
  data,
  total,
  page,
  limit,
  sort,
  selectedRows,
  search,
  loading,
  isFetching,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  onPageChange,
  onLimitChange,
  onSort,
  onFilter,
  onSearch,
  onRowSelect,
  onRowClick,
  onCreate,
  onEdit,
  onDelete,
  onBulkDelete,
  onRefresh,
}: DynamicListViewProps) {
  // Derive ColumnConfig[] for filter bar
  const columns = useMemo(() => entitySchemaToColumnConfigs(schema), [schema]);

  const hasSelection = selectedRows.length > 0;

  return (
    <div className="space-y-4">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {schema.icon && <span className="text-2xl">{schema.icon}</span>}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{schema.label}</h1>
            {schema.description && (
              <p className="text-sm text-text-muted mt-0.5">{schema.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          {onRefresh && (
            <BaseButton
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data"
            >
              🔄 Refresh
            </BaseButton>
          )}

          {/* Bulk delete */}
          {canDelete && hasSelection && onBulkDelete && (
            <BaseButton variant="danger" size="sm" onClick={onBulkDelete}>
              🗑 Delete ({selectedRows.length})
            </BaseButton>
          )}

          {/* Create */}
          {canCreate && onCreate && (
            <BaseButton onClick={onCreate}>+ Create {schema.label}</BaseButton>
          )}
        </div>
      </div>

      {/* ─── Filter Bar ────────────────────────────────────── */}
      <BaseFilterBar
        columns={columns}
        onFilter={onFilter}
        onSearch={onSearch}
        searchValue={search}
      />

      {/* ─── Fetching indicator ────────────────────────────── */}
      {isFetching && !loading && (
        <div className="text-xs text-text-muted flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Updating...
        </div>
      )}

      {/* ─── Table ─────────────────────────────────────────── */}
      <DynamicTable
        schema={schema}
        data={data}
        total={total}
        page={page}
        limit={limit}
        sort={sort}
        selectedRows={selectedRows}
        loading={loading}
        striped
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onSort={onSort}
        onRowSelect={onRowSelect}
        onRowClick={onRowClick}
        onEdit={canUpdate ? onEdit : undefined}
        onDelete={canDelete ? onDelete : undefined}
        emptyContent={
          <div className="text-center py-12">
            <p className="text-lg text-text-muted mb-2">No {schema.label.toLowerCase()} found</p>
            <p className="text-sm text-text-muted">
              {canCreate
                ? 'Click "Create" to add a new record.'
                : 'No records match the current filters.'}
            </p>
          </div>
        }
      />

      {/* ─── Footer info ───────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          {total > 0
            ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
            : 'No records'}
        </span>
        {hasSelection && <span>{selectedRows.length} selected</span>}
      </div>
    </div>
  );
}

DynamicListView.displayName = 'DynamicListView';
