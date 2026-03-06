import React from 'react';
import { BaseButton, BaseModal } from '../../../components/base';

// ============================================================
// DeleteConfirmDialog - Simple delete confirmation
// ============================================================

export interface DeleteConfirmDialogComponentProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityLabel: string;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  entityLabel,
}: DeleteConfirmDialogComponentProps) {
  return (
    <BaseModal open={open} onClose={onClose} title={`Delete ${entityLabel}`}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete this {entityLabel.toLowerCase()}? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <BaseButton variant="secondary" onClick={onClose}>
            Cancel
          </BaseButton>
          <BaseButton variant="danger" onClick={onConfirm}>
            Delete
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  );
}

DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';
