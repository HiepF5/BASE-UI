import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BaseTable, BaseForm, BaseModal, BaseFilterBar,
  BaseButton, ConfirmDialog, Card,
} from '@/components/base';
import { QueryBuilder } from '@/components/query-builder';
import { useCrud, useSchema, useTableList, useDebounce, useToggle } from '@/hooks';
import { useTableStore } from '@/stores';
import { createEmptyFilter } from '@/core/utils';
import type { ColumnConfig, FilterGroup } from '@/types';

/* ═══════════════════════════════════════════════════════════
   DynamicCrudPage — Metadata-driven CRUD
   Theo rule: base_ui.md, Filter + Query Builder UI.md
   ═══════════════════════════════════════════════════════════ */

const DynamicCrudPage: React.FC = () => {
  const { entity: paramEntity } = useParams<{ entity: string }>();
  const navigate = useNavigate();
  const { data: tables } = useTableList();

  const [entity, setEntity] = useState(paramEntity ?? '');
  useEffect(() => {
    if (paramEntity) setEntity(paramEntity);
  }, [paramEntity]);

  /* Schema */
  const { data: schema, isLoading: schemaLoading } = useSchema(entity || undefined);

  /* Auto-build ColumnConfig from schema */
  const columns: ColumnConfig[] = useMemo(() => {
    if (!schema) return [];
    return schema.columns.map((col) => ({
      name: col.name,
      label: col.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      type: mapDbType(col.type),
      visible: true,
      sortable: true,
      filterable: true,
      editable: !col.isPrimary,
      required: !col.nullable && !col.isPrimary,
    }));
  }, [schema]);

  /* Table state */
  const { setPage, setLimit, setSort, setFilter, setSearch, getSlice, buildQuery,
          toggleSelect, selectAll, clearSelection } = useTableStore();
  const slice = getSlice(entity);

  /* CRUD */
  const { listQuery, createMutation, updateMutation, deleteMutation, bulkDeleteMutation } =
    useCrud({ entity, enabled: !!entity });

  /* Search debounce */
  const debouncedSearch = useDebounce(slice.search, 300);
  useEffect(() => {
    if (entity) setSearch(entity, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /* Modals */
  const formModal = useToggle();
  const deleteModal = useToggle();
  const filterModal = useToggle();
  const [editRow, setEditRow] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  /* Handlers */
  const handleCreate = () => { setEditRow(null); formModal.setTrue(); };
  const handleEdit = (row: any) => { setEditRow(row); formModal.setTrue(); };
  const handleDelete = (row: any) => { setDeleteTarget(row); deleteModal.setTrue(); };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editRow) {
        const pk = schema?.primaryKey?.[0] ?? 'id';
        await updateMutation.mutateAsync({ id: editRow[pk], data });
      } else {
        await createMutation.mutateAsync(data);
      }
      formModal.setFalse();
    } catch { /* toast in hook */ }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const pk = schema?.primaryKey?.[0] ?? 'id';
    await deleteMutation.mutateAsync(deleteTarget[pk]);
    deleteModal.setFalse();
    setDeleteTarget(null);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(slice.selectedIds);
    if (!ids.length) return;
    await bulkDeleteMutation.mutateAsync(ids);
    clearSelection(entity);
  };

  /* Filter */
  const [tempFilter, setTempFilter] = useState<FilterGroup>(createEmptyFilter());
  const openFilter = () => { setTempFilter(slice.filter); filterModal.setTrue(); };
  const applyFilter = () => { setFilter(entity, tempFilter); filterModal.setFalse(); };
  const clearFilter = () => { setFilter(entity, createEmptyFilter()); filterModal.setFalse(); };

  /* Entity selector */
  if (!entity) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">CRUD Manager</h2>
        <p className="text-sm text-gray-500">Chọn bảng để quản lý dữ liệu</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tables?.map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/crud/${t}`)}
              className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <span className="font-medium text-gray-800">{t}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 capitalize">{entity}</h2>
          <p className="text-sm text-gray-500">{listQuery.data?.total ?? 0} bản ghi</p>
        </div>
        <div className="flex gap-2">
          {slice.selectedIds.size > 0 && (
            <BaseButton variant="danger" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4" /> Xóa {slice.selectedIds.size}
            </BaseButton>
          )}
          <BaseButton size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4" /> Tạo mới
          </BaseButton>
        </div>
      </div>

      {/* Filter bar */}
      <BaseFilterBar
        search={slice.search}
        onSearchChange={(v) => setSearch(entity, v)}
        onFilter={openFilter}
        filterCount={slice.filter.conditions.length}
        onRefresh={() => listQuery.refetch()}
      />

      {/* Table */}
      <BaseTable
        columns={columns}
        data={listQuery.data?.data ?? []}
        total={listQuery.data?.total ?? 0}
        page={slice.page}
        limit={slice.limit}
        sort={slice.sort}
        loading={listQuery.isLoading}
        selectedIds={slice.selectedIds}
        primaryKey={schema?.primaryKey?.[0] ?? 'id'}
        onSort={(s) => setSort(entity, s)}
        onPageChange={(p) => setPage(entity, p)}
        onLimitChange={(l) => setLimit(entity, l)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={(id) => toggleSelect(entity, id)}
        onSelectAll={(ids) => selectAll(entity, ids)}
      />

      {/* Form modal */}
      <BaseModal
        open={formModal.value}
        onClose={formModal.setFalse}
        title={editRow ? `Sửa ${entity}` : `Tạo ${entity}`}
        size="lg"
      >
        <BaseForm
          columns={columns}
          defaultValues={editRow ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={formModal.setFalse}
          loading={createMutation.isPending || updateMutation.isPending}
          mode={editRow ? 'edit' : 'create'}
        />
      </BaseModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteModal.value}
        onClose={deleteModal.setFalse}
        onConfirm={handleConfirmDelete}
        title="Xóa bản ghi"
        message="Bạn có chắc chắn muốn xóa bản ghi này? Thao tác không thể hoàn tác."
        loading={deleteMutation.isPending}
      />

      {/* Filter modal */}
      <BaseModal
        open={filterModal.value}
        onClose={filterModal.setFalse}
        title="Bộ lọc nâng cao"
        size="xl"
        footer={
          <>
            <BaseButton variant="ghost" onClick={clearFilter}>Xóa bộ lọc</BaseButton>
            <BaseButton onClick={applyFilter}>Áp dụng</BaseButton>
          </>
        }
      >
        <QueryBuilder
          value={tempFilter}
          onChange={setTempFilter}
          columns={columns}
        />
      </BaseModal>
    </div>
  );
};

/* ── Helpers ── */
function mapDbType(dbType: string): ColumnConfig['type'] {
  const t = dbType.toLowerCase();
  if (t.includes('int') || t.includes('float') || t.includes('decimal') || t.includes('numeric') || t.includes('double') || t.includes('real')) return 'number';
  if (t.includes('bool')) return 'boolean';
  if (t.includes('timestamp') || t.includes('datetime')) return 'datetime';
  if (t.includes('date')) return 'date';
  if (t.includes('json') || t.includes('jsonb')) return 'json';
  if (t.includes('text')) return 'textarea';
  return 'text';
}

export default DynamicCrudPage;
