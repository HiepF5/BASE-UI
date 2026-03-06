// ============================================================
// Dynamic CRUD Hooks
// ============================================================

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCrudEngine } from '../../../hooks/useCrudEngine';

export interface UseDynamicCrudOptions {
  connectionId?: string;
}

/**
 * Hook for managing dynamic CRUD page state
 * Wraps useCrudEngine with modal states and handlers
 */
export function useDynamicCrud(entityName: string, options: UseDynamicCrudOptions = {}) {
  const { connectionId = 'default' } = options;

  // CRUD Engine (orchestrator)
  const engine = useCrudEngine(entityName, { connectionId });

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [deletingRow, setDeletingRow] = useState<Record<string, unknown> | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Handlers
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

  const handleCreateSubmit = useCallback(
    async (data: Record<string, unknown>) => {
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

  const handleEditSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!editingRow) return;
      const pk = engine.schema?.primaryKey || 'id';
      const id = editingRow[pk] as string | number;
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
    const id = deletingRow[pk] as string | number;
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

  return {
    // Engine data
    engine,

    // Modal states
    createOpen,
    editingRow,
    deletingRow,
    bulkDeleteOpen,

    // Handlers
    onCreate: handleCreate,
    onCloseCreate: handleCloseCreate,
    onEdit: handleEdit,
    onCloseEdit: handleCloseEdit,
    onDelete: handleDelete,
    onCloseDelete: handleCloseDelete,
    onBulkDelete: handleBulkDelete,
    onCloseBulkDelete: handleCloseBulkDelete,
    onCreateSubmit: handleCreateSubmit,
    onEditSubmit: handleEditSubmit,
    onConfirmDelete: handleConfirmDelete,
    onConfirmBulkDelete: handleConfirmBulkDelete,
    onRefresh: handleRefresh,
  };
}
