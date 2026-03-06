import React from 'react';
import { BaseModal, BaseButton } from '../../../components/base';
import type { DeleteConfirmDialogProps } from '../types/dynamic-crud.types';

// ============================================================
// DeleteConfirmDialog - Reusable delete confirmation modal
// Pure presentational – receives callbacks, renders confirmation UI
// ============================================================

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  message,
  entityLabel = 'record',
  count = 1,
}: DeleteConfirmDialogProps) {
  const isBulk = count > 1;
  const displayTitle = title || (isBulk ? 'Confirm Bulk Delete' : 'Confirm Delete');
  const displayMessage = message || (
    <p className="text-sm text-text-secondary">
      {isBulk ? (
        <>
          Are you sure you want to delete <strong className="text-text-primary">{count}</strong>{' '}
          {entityLabel}
          {count > 1 ? 's' : ''}? This action cannot be undone.
        </>
      ) : (
        <>Are you sure you want to delete this {entityLabel}? This action cannot be undone.</>
      )}
    </p>
  );

  return (
    <BaseModal open={open} onClose={onClose} title={displayTitle} size="sm">
      <div className="space-y-4">
        {/* Warning icon + message */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="flex-1 pt-1">{displayMessage}</div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <BaseButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </BaseButton>
          <BaseButton variant="danger" onClick={onConfirm} loading={loading}>
            {isBulk ? `Delete ${count} items` : 'Delete'}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  );
}

DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';
