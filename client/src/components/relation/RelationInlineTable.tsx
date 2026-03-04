import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseButton, BaseModal } from '../base';
import { FieldRenderer } from '../dynamic/FieldRenderer';
import { useRelationCrud } from '../../hooks/useRelationCrud';
import { useRelationOptions } from '../../hooks/useEntitySchema';
import { schemaRegistry } from '../../config/schema.config';
import type { EntitySchema, FieldSchema } from '../../core/metadata/schema.types';
import {
  buildFormSchema,
  buildDefaultValues,
  getCreateFields,
  getEditFields,
} from '../../core/metadata';
import { cn } from '../../core/utils';
import toast from 'react-hot-toast';

// ============================================================
// RelationInlineTable – OneToMany inline CRUD table
// Renders child records in a compact table with add/edit/delete
// Uses useRelationCrud for data fetching + mutations
// Auto-injects parent FK value when creating children
// ============================================================

export interface RelationInlineTableProps {
  /** Relation field metadata (from parent schema) */
  field: FieldSchema;
  /** Parent record's primary key value */
  parentId: string | number | null;
  /** Connection ID */
  connectionId?: string;
  /** Disabled (view-only) */
  disabled?: boolean;
  /** Compact mode (less padding) */
  compact?: boolean;
  /** Max rows visible before scrolling */
  maxRows?: number;
  /** Relation options for child entity's own relation fields */
  childRelationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  childRelationLoading?: Record<string, boolean>;
}

export function RelationInlineTable({
  field,
  parentId,
  connectionId = 'default',
  disabled = false,
  compact = false,
  maxRows = 10,
  childRelationOptions,
  childRelationLoading,
}: RelationInlineTableProps) {
  const relation = field.relation;
  const childEntity = relation?.target ?? '';
  const foreignKey = relation?.foreignKey || `${field.name}_id`;

  // Look up child entity schema (for table columns + form fields)
  const childSchema = useMemo<EntitySchema | null>(
    () => (childEntity ? schemaRegistry[childEntity] || null : null),
    [childEntity],
  );

  // Get visible fields for inline table (exclude PK and FK fields)
  const tableFields = useMemo(() => {
    if (!childSchema) return [];
    return childSchema.fields.filter(
      (f) => f.visibleInTable !== false && !f.isPrimary && f.name !== foreignKey,
    );
  }, [childSchema, foreignKey]);

  // CRUD hook for child records
  const crud = useRelationCrud(childEntity, {
    parentId,
    foreignKey,
    connectionId,
    enabled: !!parentId && !!relation,
  });

  // Load child entity's own relation options
  const childFields = childSchema?.fields ?? [];
  const { optionsMap, loadingMap } = useRelationOptions(connectionId, childFields);

  // Merge with prop overrides
  const allRelOptions = useMemo(
    () => ({ ...optionsMap, ...childRelationOptions }),
    [optionsMap, childRelationOptions],
  );
  const allRelLoading = useMemo(
    () => ({ ...loadingMap, ...childRelationLoading }),
    [loadingMap, childRelationLoading],
  );

  // Modal states
  const [addOpen, setAddOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletingRow, setDeletingRow] = useState<Record<string, any> | null>(null);

  // Handlers
  const handleAdd = useCallback(() => setAddOpen(true), []);
  const handleCloseAdd = useCallback(() => setAddOpen(false), []);
  const handleEdit = useCallback((row: Record<string, unknown>) => setEditingRow(row), []);
  const handleCloseEdit = useCallback(() => setEditingRow(null), []);
  const handleDelete = useCallback((row: Record<string, unknown>) => setDeletingRow(row), []);
  const handleCloseDelete = useCallback(() => setDeletingRow(null), []);

  const handleCreateSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: Record<string, any>) => {
      try {
        await crud.create(data);
        toast.success(`${childSchema?.label || childEntity} added`);
        setAddOpen(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Create failed');
      }
    },
    [crud, childSchema, childEntity],
  );

  const handleEditSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: Record<string, any>) => {
      if (!editingRow) return;
      const pk = childSchema?.primaryKey || 'id';
      try {
        await crud.update(editingRow[pk], data);
        toast.success(`${childSchema?.label || childEntity} updated`);
        setEditingRow(null);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Update failed');
      }
    },
    [editingRow, crud, childSchema, childEntity],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingRow) return;
    const pk = childSchema?.primaryKey || 'id';
    try {
      await crud.remove(deletingRow[pk]);
      toast.success(`${childSchema?.label || childEntity} removed`);
      setDeletingRow(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }, [deletingRow, crud, childSchema, childEntity]);

  // Resolve cell display value
  const renderCellValue = useCallback(
    (row: Record<string, unknown>, col: FieldSchema) => {
      const val = row[col.name];

      // Relation field → show display label from options
      if (col.type === 'relation' && col.relation) {
        const opts = allRelOptions[col.name] ?? [];
        const found = opts.find((o) => String(o.value) === String(val));
        return found?.label ?? String(val ?? '—');
      }

      // Boolean
      if (col.type === 'boolean') {
        return val ? '✅' : '❌';
      }

      // Number formatting
      if (col.type === 'number' && val != null) {
        return Number(val).toLocaleString();
      }

      return String(val ?? '—');
    },
    [allRelOptions],
  );

  // No relation metadata → nothing to render
  if (!relation) return null;

  // No parent ID yet → show placeholder
  if (!parentId) {
    return (
      <div className="border border-dashed border-border rounded-lg p-4 text-center">
        <p className="text-sm text-text-muted">
          💡 Save the main record first to manage {field.label}.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text-primary">{field.label}</h4>
          <span className="text-xs text-text-muted bg-bg px-1.5 py-0.5 rounded-full">
            {crud.total} {crud.total === 1 ? 'record' : 'records'}
          </span>
        </div>
        {!disabled && (
          <BaseButton size="sm" variant="primary" onClick={handleAdd}>
            + Add
          </BaseButton>
        )}
      </div>

      {/* Table */}
      {crud.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
        </div>
      ) : crud.data.length === 0 ? (
        <div className="py-6 text-center text-sm text-text-muted">
          No {field.label.toLowerCase()} yet.
          {!disabled && ' Click "+ Add" to create one.'}
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ maxHeight: maxRows * (compact ? 36 : 44) }}>
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary sticky top-0">
              <tr>
                {tableFields.map((col) => (
                  <th
                    key={col.name}
                    className={cn(
                      'text-left text-xs font-medium text-text-secondary border-b border-border',
                      compact ? 'px-2 py-1.5' : 'px-3 py-2',
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                {!disabled && (
                  <th
                    className={cn(
                      'text-right text-xs font-medium text-text-secondary border-b border-border w-20',
                      compact ? 'px-2 py-1.5' : 'px-3 py-2',
                    )}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {(crud.data as Record<string, unknown>[]).map((row, idx) => (
                <tr
                  key={String(row.id ?? idx)}
                  className={cn(
                    'border-b border-border last:border-b-0 transition-colors',
                    idx % 2 === 0 ? 'bg-bg' : 'bg-bg-secondary/30',
                    'hover:bg-primary-50/30',
                  )}
                >
                  {tableFields.map((col) => (
                    <td
                      key={col.name}
                      className={cn('text-text', compact ? 'px-2 py-1' : 'px-3 py-2')}
                    >
                      {renderCellValue(row, col)}
                    </td>
                  ))}
                  {!disabled && (
                    <td className={cn('text-right', compact ? 'px-2 py-1' : 'px-3 py-2')}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="text-xs px-1.5 py-0.5 rounded text-primary-600 hover:bg-primary-50"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-xs px-1.5 py-0.5 rounded text-danger hover:bg-red-50"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fetching indicator */}
      {crud.isFetching && !crud.isLoading && (
        <div className="px-4 py-1 bg-primary-50 text-xs text-primary-600 text-center">
          Refreshing...
        </div>
      )}

      {/* ─── Add Modal ──────────────────────────────────── */}
      <BaseModal
        open={addOpen}
        onClose={handleCloseAdd}
        title={`Add ${childSchema?.label || childEntity}`}
        size="lg"
      >
        {childSchema && (
          <InlineForm
            schema={childSchema}
            mode="create"
            excludeFields={[foreignKey]}
            onSubmit={handleCreateSubmit}
            onCancel={handleCloseAdd}
            loading={crud.isCreating}
            relationOptions={allRelOptions}
            relationLoading={allRelLoading}
          />
        )}
      </BaseModal>

      {/* ─── Edit Modal ─────────────────────────────────── */}
      <BaseModal
        open={!!editingRow}
        onClose={handleCloseEdit}
        title={`Edit ${childSchema?.label || childEntity}`}
        size="lg"
      >
        {childSchema && editingRow && (
          <InlineForm
            schema={childSchema}
            mode="edit"
            excludeFields={[foreignKey]}
            defaultValues={editingRow}
            onSubmit={handleEditSubmit}
            onCancel={handleCloseEdit}
            loading={crud.isUpdating}
            relationOptions={allRelOptions}
            relationLoading={allRelLoading}
          />
        )}
      </BaseModal>

      {/* ─── Delete Confirm ─────────────────────────────── */}
      <BaseModal
        open={!!deletingRow}
        onClose={handleCloseDelete}
        title="Confirm Delete"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={handleCloseDelete}>
              Cancel
            </BaseButton>
            <BaseButton variant="danger" onClick={handleConfirmDelete} loading={crud.isDeleting}>
              Delete
            </BaseButton>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete this {childSchema?.label?.toLowerCase() || 'record'}? This
          action cannot be undone.
        </p>
      </BaseModal>
    </div>
  );
}

RelationInlineTable.displayName = 'RelationInlineTable';

// ─── InlineForm (internal) ─────────────────────────────────

interface InlineFormProps {
  schema: EntitySchema;
  mode: 'create' | 'edit';
  excludeFields?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  relationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  relationLoading?: Record<string, boolean>;
}

function InlineForm({
  schema,
  mode,
  excludeFields = [],
  defaultValues: defaultValuesProp,
  onSubmit,
  onCancel,
  loading,
  relationOptions,
  relationLoading,
}: InlineFormProps) {
  // Build fields excluding FK and hidden fields
  const fields = useMemo(() => {
    const base = mode === 'create' ? getCreateFields(schema) : getEditFields(schema);
    return base.filter((f) => !excludeFields.includes(f.name) && f.relation?.type !== 'OneToMany');
  }, [schema, mode, excludeFields]);

  const zodSchema = useMemo(() => buildFormSchema(fields, mode), [fields, mode]);
  const defaults = useMemo(
    () => buildDefaultValues(fields, defaultValuesProp),
    [fields, defaultValuesProp],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: defaults,
  });

  const handleFormSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === '' || value === undefined) continue;
        cleaned[key] = value;
      }
      await onSubmit(cleaned);
    },
    [onSubmit],
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.name}
            className={cn((field.type === 'textarea' || field.type === 'json') && 'md:col-span-2')}
          >
            <FieldRenderer
              field={field}
              register={register}
              control={control}
              errors={errors}
              disabled={loading}
              relationOptions={relationOptions?.[field.name]}
              relationLoading={relationLoading?.[field.name]}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <BaseButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading || isSubmitting}
        >
          Cancel
        </BaseButton>
        <BaseButton type="submit" loading={loading || isSubmitting}>
          {mode === 'create' ? 'Add' : 'Save'}
        </BaseButton>
      </div>
    </form>
  );
}
