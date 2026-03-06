import React from 'react';
import { useParams } from 'react-router-dom';
import { BaseSpinner } from '../../../components/base';
import {
  DynamicListView,
  DynamicCreateModal,
  DynamicEditModal,
  DeleteConfirmDialog,
} from '../components';
import { useDynamicCrud } from '../hooks/useDynamicCrud';
import type { DynamicCrudPageProps } from '../types/dynamic-crud.types';

// ============================================================
// DynamicCrudPage - Full metadata-driven CRUD page
// Composes: DynamicListView + DynamicCreateModal + DynamicEditModal
//           + DeleteConfirmDialog
// Uses: useDynamicCrud (orchestrator hook)
// Pattern: Smart page (modules/) composes base components
// ============================================================

export function DynamicCrudPage({ entityName, connectionId }: DynamicCrudPageProps) {
  const { connectionId: routeConnectionId, entity: routeEntity } = useParams<{
    connectionId: string;
    entity: string;
  }>();

  const entity = entityName || routeEntity || '';
  const connId = connectionId || routeConnectionId || 'default';

  const {
    engine,
    createOpen,
    editingRow,
    deletingRow,
    bulkDeleteOpen,
    onCreate,
    onCloseCreate,
    onEdit,
    onCloseEdit,
    onDelete,
    onCloseDelete,
    onBulkDelete,
    onCloseBulkDelete,
    onCreateSubmit,
    onEditSubmit,
    onConfirmDelete,
    onConfirmBulkDelete,
    onRefresh,
  } = useDynamicCrud(entity, { connectionId: connId });

  // ─── Loading state for schema ───────────────────────────
  if (engine.schemaLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BaseSpinner size="lg" />
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────
  if (engine.schemaError || !engine.schema) {
    return (
      <div className="p-6 text-center">
        <p className="text-danger text-lg mb-2">Failed to load schema</p>
        <p className="text-text-muted text-sm">
          {engine.schemaError?.message || `Entity "${entity}" not found in schema registry.`}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ─── List View ──────────────────────────────────────── */}
      <DynamicListView
        schema={engine.schema}
        data={engine.crud.data as Record<string, unknown>[]}
        total={engine.crud.total}
        page={engine.page}
        limit={engine.limit}
        sort={engine.sort}
        selectedRows={engine.selectedRows}
        search={engine.search}
        loading={engine.crud.isLoading}
        isFetching={engine.crud.isFetching}
        canCreate={engine.canCreate}
        canUpdate={engine.canUpdate}
        canDelete={engine.canDelete}
        onPageChange={engine.setPage}
        onLimitChange={engine.setLimit}
        onSort={engine.setSort}
        onFilter={engine.setFilter}
        onSearch={engine.setSearch}
        onRowSelect={engine.setSelectedRows}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
        onBulkDelete={onBulkDelete}
        onRefresh={onRefresh}
      />

      {/* ─── Create Modal ───────────────────────────────────── */}
      <DynamicCreateModal
        open={createOpen}
        onClose={onCloseCreate}
        schema={engine.schema}
        onSubmit={onCreateSubmit}
        loading={engine.crud.isCreating}
        relationOptions={engine.relationOptions}
        relationLoading={engine.relationLoading}
      />

      {/* ─── Edit Modal ─────────────────────────────────────── */}
      <DynamicEditModal
        open={Boolean(editingRow)}
        onClose={onCloseEdit}
        schema={engine.schema}
        data={editingRow}
        onSubmit={onEditSubmit}
        loading={engine.crud.isUpdating}
        relationOptions={engine.relationOptions}
        relationLoading={engine.relationLoading}
      />

      {/* ─── Delete Confirm ─────────────────────────────────── */}
      <DeleteConfirmDialog
        open={Boolean(deletingRow)}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        loading={engine.crud.isDeleting}
        entityLabel={engine.entityLabel.toLowerCase()}
      />

      {/* ─── Bulk Delete Confirm ────────────────────────────── */}
      <DeleteConfirmDialog
        open={bulkDeleteOpen}
        onClose={onCloseBulkDelete}
        onConfirm={onConfirmBulkDelete}
        loading={engine.crud.isBulkDeleting}
        entityLabel={engine.entityLabel.toLowerCase()}
        count={engine.selectedRows.length}
      />
    </>
  );
}

DynamicCrudPage.displayName = 'DynamicCrudPage';
