import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCrudEngine } from '../../hooks/useCrudEngine';
import { DynamicListView } from './DynamicListView';
import { DynamicCreateModal } from './DynamicCreateModal';
import { DynamicEditModal } from './DynamicEditModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { BaseSpinner } from '../../components/base';
import toast from 'react-hot-toast';

// ============================================================
// DynamicCrudPage - Full metadata-driven CRUD page
// Composes: DynamicListView + DynamicCreateModal + DynamicEditModal
//           + DeleteConfirmDialog
// Uses: useCrudEngine (orchestrator hook)
// Pattern: Smart page (modules/) composes base components
// ============================================================

export interface DynamicCrudPageProps {
  /** Static entity name (alternative to route param) */
  entityName?: string;
  /** Connection ID override */
  connectionId?: string;
}

export function DynamicCrudPage({ entityName, connectionId }: DynamicCrudPageProps) {
  const { connectionId: routeConnectionId, entity: routeEntity } = useParams<{
    connectionId: string;
    entity: string;
  }>();

  const entity = entityName || routeEntity || '';
  const connId = connectionId || routeConnectionId || 'default';

  // ─── CRUD Engine (orchestrator) ─────────────────────────
  const engine = useCrudEngine(entity, { connectionId: connId });

  // ─── Modal states ───────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletingRow, setDeletingRow] = useState<Record<string, any> | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // ─── Handlers ───────────────────────────────────────────

  const handleCreate = useCallback(() => setCreateOpen(true), []);
  const handleCloseCreate = useCallback(() => setCreateOpen(false), []);

  const handleEdit = useCallback((row: Record<string, unknown>) => {
    setEditingRow(row);
  }, []);
  const handleCloseEdit = useCallback(() => setEditingRow(null), []);

  const handleDelete = useCallback((row: Record<string, unknown>) => {
    setDeletingRow(row);
  }, []);
  const handleCloseDelete = useCallback(() => setDeletingRow(null), []);

  const handleBulkDelete = useCallback(() => setBulkDeleteOpen(true), []);
  const handleCloseBulkDelete = useCallback(() => setBulkDeleteOpen(false), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateSubmit = useCallback(
    async (data: Record<string, any>) => {
      try {
        await engine.crud.create(data);
        toast.success(`${engine.entityLabel} created successfully`);
        setCreateOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Create failed';
        toast.error(message);
      }
    },
    [engine.crud, engine.entityLabel],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditSubmit = useCallback(
    async (data: Record<string, any>) => {
      if (!editingRow) return;
      const pk = engine.schema?.primaryKey || 'id';
      const id = editingRow[pk];
      try {
        await engine.crud.update({ id, data });
        toast.success(`${engine.entityLabel} updated successfully`);
        setEditingRow(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Update failed';
        toast.error(message);
      }
    },
    [editingRow, engine.crud, engine.entityLabel, engine.schema],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingRow) return;
    const pk = engine.schema?.primaryKey || 'id';
    const id = deletingRow[pk];
    try {
      await engine.crud.remove(id);
      toast.success(`${engine.entityLabel} deleted successfully`);
      setDeletingRow(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      toast.error(message);
    }
  }, [deletingRow, engine.crud, engine.entityLabel, engine.schema]);

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      await engine.crud.bulkDelete(engine.selectedRows);
      toast.success(`Deleted ${engine.selectedRows.length} ${engine.entityLabel.toLowerCase()}(s)`);
      engine.clearSelection();
      setBulkDeleteOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bulk delete failed';
      toast.error(message);
    }
  }, [engine]);

  const handleRefresh = useCallback(() => {
    engine.crud.refetch();
  }, [engine.crud]);

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
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={handleRefresh}
      />

      {/* ─── Create Modal ───────────────────────────────────── */}
      <DynamicCreateModal
        open={createOpen}
        onClose={handleCloseCreate}
        schema={engine.schema}
        onSubmit={handleCreateSubmit}
        loading={engine.crud.isCreating}
        relationOptions={engine.relationOptions}
        relationLoading={engine.relationLoading}
      />

      {/* ─── Edit Modal ─────────────────────────────────────── */}
      <DynamicEditModal
        open={Boolean(editingRow)}
        onClose={handleCloseEdit}
        schema={engine.schema}
        data={editingRow}
        onSubmit={handleEditSubmit}
        loading={engine.crud.isUpdating}
        relationOptions={engine.relationOptions}
        relationLoading={engine.relationLoading}
      />

      {/* ─── Delete Confirm ─────────────────────────────────── */}
      <DeleteConfirmDialog
        open={Boolean(deletingRow)}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        loading={engine.crud.isDeleting}
        entityLabel={engine.entityLabel.toLowerCase()}
      />

      {/* ─── Bulk Delete Confirm ────────────────────────────── */}
      <DeleteConfirmDialog
        open={bulkDeleteOpen}
        onClose={handleCloseBulkDelete}
        onConfirm={handleConfirmBulkDelete}
        loading={engine.crud.isBulkDeleting}
        entityLabel={engine.entityLabel.toLowerCase()}
        count={engine.selectedRows.length}
      />
    </>
  );
}

DynamicCrudPage.displayName = 'DynamicCrudPage';
