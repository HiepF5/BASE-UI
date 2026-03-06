import React from 'react';
import { DynamicTable, DynamicForm } from '../../../components/dynamic';
import { BaseModal } from '../../../components/base';
import { EXAMPLE_ENTITIES } from '../config/example-app.config';
import { useExampleApp } from '../hooks/useExampleApp';
import {
  EntitySelector,
  ConfigBanner,
  EntityHeader,
  SearchBar,
  ActiveFilterBanner,
  FilterPanel,
  SaveFilterDialog,
  DeleteConfirmDialog,
  FooterStats,
  ChecklistBanner,
} from '../components';

// ============================================================
// ExampleAppPage – Phase 4: Example App
// User chỉ cần config JSON để có hệ thống
// Demonstrates: CRUD auto render, Filter auto render,
//   Relation inline edit, Saved filter, Pagination
// ============================================================

export default function ExampleAppPage() {
  const {
    // Entity
    activeEntity,
    setActiveEntity,
    schema,

    // Pagination
    page,
    setPage,
    limit,
    setLimit,

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
    entitySavedFilters,
    showSaveDialog,
    setShowSaveDialog,
    filterName,
    setFilterName,

    // Search
    search,
    setSearch,

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
  } = useExampleApp();

  if (!schema) {
    return <div className="p-6 text-center text-text-muted">Entity not found</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ─── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">📋 Example App</h1>
        <p className="text-sm text-text-muted mt-1">
          Phase 4 – User chỉ cần config JSON để có hệ thống. Select entity → auto CRUD, filter,
          relation, pagination.
        </p>
      </div>

      {/* ─── Config JSON Preview Banner ── */}
      <ConfigBanner
        schema={schema}
        showConfig={showConfig}
        onToggle={() => setShowConfig(!showConfig)}
      />

      {/* ─── Entity Selector ── */}
      <EntitySelector
        entities={EXAMPLE_ENTITIES}
        activeEntity={activeEntity}
        onSelect={setActiveEntity}
      />

      {/* ─── Action Bar ── */}
      <EntityHeader
        schema={schema}
        showFilterPanel={showFilterPanel}
        hasActiveFilter={Boolean(appliedFilter)}
        canCreate={schema.permissions?.create !== false}
        onToggleFilter={() => setShowFilterPanel(!showFilterPanel)}
        onCreate={() => setCreateOpen(true)}
      />

      {/* ─── Search Bar ── */}
      <SearchBar
        value={search}
        placeholder={`Search ${schema.label.toLowerCase()}...`}
        onChange={setSearch}
      />

      {/* ─── Filter Panel (QueryBuilder + Saved Filters) ── */}
      {showFilterPanel && (
        <FilterPanel
          queryFields={queryFields}
          filterAST={filterAST}
          onFilterChange={setFilterAST}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          onSave={() => setShowSaveDialog(true)}
          savedFilters={entitySavedFilters}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteSavedFilter}
        />
      )}

      {/* ─── Applied Filter Info ── */}
      {appliedFilter && !showFilterPanel && (
        <ActiveFilterBanner
          conditionCount={conditionCount}
          sqlPreview={sqlPreview}
          onEdit={() => setShowFilterPanel(true)}
          onClear={handleClearFilter}
        />
      )}

      {/* ─── Data Table (auto-rendered from EntitySchema) ── */}
      <DynamicTable
        schema={schema}
        data={paginatedData}
        total={total}
        page={page}
        limit={limit}
        sort={sort}
        selectedRows={selectedRows}
        loading={false}
        striped
        showPagination
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSort={setSort}
        onRowSelect={setSelectedRows}
        onEdit={(row) => setEditingRow(row)}
        onDelete={(row) => setDeleteRow(row)}
      />

      {/* ─── Footer Stats ── */}
      <FooterStats
        page={page}
        limit={limit}
        total={total}
        selectedCount={selectedRows.length}
        fieldCount={schema.fields.length}
        relationCount={schema.fields.filter((f) => f.type === 'relation').length}
      />

      {/* ─── Create Modal ── */}
      <BaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={`Create ${schema.label}`}
        size="lg"
      >
        <DynamicForm
          schema={schema}
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          layout="grid"
          relationOptions={relationOptions}
          relationLoading={{}}
        />
      </BaseModal>

      {/* ─── Edit Modal (Relation inline edit in edit mode) ── */}
      <BaseModal
        open={Boolean(editingRow)}
        onClose={() => setEditingRow(null)}
        title={`Edit ${schema.label}`}
        size="lg"
      >
        {editingRow && (
          <DynamicForm
            schema={schema}
            mode="edit"
            defaultValues={editingRow}
            onSubmit={handleEdit}
            onCancel={() => setEditingRow(null)}
            layout="grid"
            relationOptions={relationOptions}
            relationLoading={{}}
            parentId={editingRow.id as number}
            connectionId="default"
          />
        )}
      </BaseModal>

      {/* ─── Delete Confirm ── */}
      <DeleteConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleDelete}
        entityLabel={schema.label}
      />

      {/* ─── Save Filter Dialog ── */}
      <SaveFilterDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        filterName={filterName}
        onFilterNameChange={setFilterName}
        onSave={handleSaveFilter}
        filterAST={filterAST}
      />

      {/* ─── Checklist ── */}
      <ChecklistBanner />
    </div>
  );
}
