import React from 'react';
import { BaseModal } from '../../../components/base';
import { DynamicForm } from '../../../components/dynamic';
import type { DynamicCreateModalProps } from '../types/dynamic-crud.types';

// ============================================================
// DynamicCreateModal - Metadata-driven create form in a modal
// Uses DynamicForm with mode='create', driven by EntitySchema
// ============================================================

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
