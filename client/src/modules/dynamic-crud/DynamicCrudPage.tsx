import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCrud } from '../../hooks/useCrud';
import { useSchema } from '../../hooks/useSchema';
import { useTableStore } from '../../stores/tableStore';
import { BaseTable, BaseForm, BaseModal, BaseFilterBar, BaseButton } from '../../components/base';
import type { ColumnConfig } from '../../types';
import toast from 'react-hot-toast';

// ============================================================
// DynamicCrudPage - Metadata-driven CRUD page
// Reads schema → renders table + form dynamically
// ============================================================

interface DynamicCrudPageProps {
  config?: { name: string; label: string };
}

export function DynamicCrudPage({ config }: DynamicCrudPageProps) {
  const { connectionId = 'default', entity: routeEntity } = useParams<{
    connectionId: string;
    entity: string;
  }>();
  const entity = config?.name || routeEntity || '';

  // Table state (Zustand)
  const tableStore = useTableStore();

  // Schema
  const { data: schema, isLoading: schemaLoading } = useSchema(connectionId, entity);

  // CRUD hook (React Query)
  const crud = useCrud(connectionId, entity, {
    page: tableStore.page,
    limit: tableStore.limit,
    sort: tableStore.sort,
    filter: tableStore.filter || undefined,
    search: tableStore.search,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Derive columns from schema
  const columns: ColumnConfig[] = React.useMemo(() => {
    if (!schema?.columns) return [];
    return schema.columns.map((col) => ({
      name: col.name,
      label: col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' '),
      type: mapColumnType(col.type),
      visible: true,
      sortable: true,
      filterable: !col.isPrimary,
      editable: !col.isPrimary,
      required: !col.nullable && !col.isPrimary,
    }));
  }, [schema]);

  // Handlers
  const handleCreate = useCallback(() => {
    setEditingRow(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((row: any) => {
    setEditingRow(row);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((row: any) => {
    setDeleteConfirm(row);
  }, []);

  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      try {
        if (editingRow) {
          await crud.update({ id: editingRow.id, data });
          toast.success('Updated successfully');
        } else {
          await crud.create(data);
          toast.success('Created successfully');
        }
        setModalOpen(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Operation failed');
      }
    },
    [editingRow, crud],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await crud.remove(deleteConfirm.id);
      toast.success('Deleted successfully');
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  }, [deleteConfirm, crud]);

  const handleBulkDelete = useCallback(async () => {
    if (tableStore.selectedRows.length === 0) return;
    try {
      await crud.bulkDelete(tableStore.selectedRows);
      toast.success(`Deleted ${tableStore.selectedRows.length} items`);
      tableStore.clearSelection();
    } catch (err: any) {
      toast.error('Bulk delete failed');
    }
  }, [tableStore.selectedRows, crud]);

  if (schemaLoading) {
    return <div className="p-6 text-neutral-400">Loading schema...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{entity.replace(/_/g, ' ')}</h1>
        <div className="flex gap-2">
          {tableStore.selectedRows.length > 0 && (
            <BaseButton variant="danger" onClick={handleBulkDelete}>
              Delete ({tableStore.selectedRows.length})
            </BaseButton>
          )}
          <BaseButton onClick={handleCreate}>+ Create</BaseButton>
        </div>
      </div>

      {/* Filter Bar */}
      <BaseFilterBar
        columns={columns}
        onFilter={tableStore.setFilter}
        onSearch={tableStore.setSearch}
        searchValue={tableStore.search}
      />

      {/* Table */}
      <BaseTable
        columns={columns}
        data={crud.data}
        total={crud.total}
        page={tableStore.page}
        limit={tableStore.limit}
        sort={tableStore.sort}
        selectedRows={tableStore.selectedRows}
        loading={crud.isLoading}
        onPageChange={tableStore.setPage}
        onLimitChange={tableStore.setLimit}
        onSort={tableStore.setSort}
        onRowSelect={tableStore.setSelectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRow ? `Edit ${entity}` : `Create ${entity}`}
        size="lg"
      >
        <BaseForm
          columns={columns}
          defaultValues={editingRow || {}}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          loading={crud.isCreating || crud.isUpdating}
          mode={editingRow ? 'edit' : 'create'}
        />
      </BaseModal>

      {/* Delete Confirm Modal */}
      <BaseModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="mb-4">Are you sure you want to delete this record?</p>
        <div className="flex justify-end gap-2">
          <BaseButton variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </BaseButton>
          <BaseButton variant="danger" onClick={handleConfirmDelete} loading={crud.isDeleting}>
            Delete
          </BaseButton>
        </div>
      </BaseModal>
    </div>
  );
}

function mapColumnType(dbType: string): ColumnConfig['type'] {
  const t = dbType.toLowerCase();
  if (t.includes('int') || t.includes('numeric') || t.includes('float') || t.includes('decimal'))
    return 'number';
  if (t.includes('bool')) return 'boolean';
  if (t.includes('date') || t.includes('timestamp')) return 'date';
  if (t.includes('text')) return 'textarea';
  return 'text';
}
