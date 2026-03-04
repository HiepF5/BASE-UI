import React from 'react';
import { BaseModal } from '../../components/base';
import { DynamicForm } from '../../components/dynamic';
import type { EntitySchema } from '../../core/metadata/schema.types';

// ============================================================
// DynamicCreateModal - Metadata-driven create form in a modal
// Uses DynamicForm with mode='create', driven by EntitySchema
// ============================================================

export interface DynamicCreateModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Entity schema (metadata) */
  schema: EntitySchema;
  /** Submit handler (receives cleaned form data) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  /** Loading state (create in progress) */
  loading?: boolean;
  /** Relation options: { fieldName: options[] } */
  relationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  /** Relation loading: { fieldName: boolean } */
  relationLoading?: Record<string, boolean>;
}

export function DynamicCreateModal({
  open,
  onClose,
  schema,
  onSubmit,
  loading,
  relationOptions,
  relationLoading,
}: DynamicCreateModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Create ${schema.label}`}
      size="lg"
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
    >
      <DynamicForm
        schema={schema}
        mode="create"
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        layout="grid"
        relationOptions={relationOptions}
        relationLoading={relationLoading}
        submitText={`Create ${schema.label}`}
      />
    </BaseModal>
  );
}

DynamicCreateModal.displayName = 'DynamicCreateModal';
