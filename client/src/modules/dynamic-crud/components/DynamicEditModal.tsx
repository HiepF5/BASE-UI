import React from 'react';
import { BaseModal } from '../../../components/base';
import { DynamicForm } from '../../../components/dynamic';
import type { DynamicEditModalProps } from '../types/dynamic-crud.types';

// ============================================================
// DynamicEditModal - Metadata-driven edit form in a modal
// Uses DynamicForm with mode='edit', pre-populated with row data
// ============================================================

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
