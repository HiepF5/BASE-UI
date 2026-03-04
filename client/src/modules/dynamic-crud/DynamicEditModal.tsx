import React from 'react';
import { BaseModal } from '../../components/base';
import { DynamicForm } from '../../components/dynamic';
import type { EntitySchema } from '../../core/metadata/schema.types';

// ============================================================
// DynamicEditModal - Metadata-driven edit form in a modal
// Uses DynamicForm with mode='edit', pre-populated with row data
// ============================================================

export interface DynamicEditModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Entity schema (metadata) */
  schema: EntitySchema;
  /** Row data to edit (used as defaultValues) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> | null;
  /** Submit handler (receives cleaned form data) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  /** Loading state (update in progress) */
  loading?: boolean;
  /** Relation options: { fieldName: options[] } */
  relationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  /** Relation loading: { fieldName: boolean } */
  relationLoading?: Record<string, boolean>;
}

export function DynamicEditModal({
  open,
  onClose,
  schema,
  data,
  onSubmit,
  loading,
  relationOptions,
  relationLoading,
}: DynamicEditModalProps) {
  if (!data) return null;

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Edit ${schema.label}`}
      size="lg"
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
    >
      <DynamicForm
        schema={schema}
        mode="edit"
        defaultValues={data}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        layout="grid"
        relationOptions={relationOptions}
        relationLoading={relationLoading}
        submitText={`Update ${schema.label}`}
      />
    </BaseModal>
  );
}

DynamicEditModal.displayName = 'DynamicEditModal';
