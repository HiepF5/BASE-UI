import React from 'react';
import { BaseButton, BaseModal } from '../../../components/base';
import {
  countConditions,
  astToSQLPreview,
  type FilterGroupNode,
} from '../../../core/query-builder';

// ============================================================
// SaveFilterDialog - Modal for saving filter with name
// ============================================================

export interface SaveFilterDialogComponentProps {
  open: boolean;
  onClose: () => void;
  filterName: string;
  onFilterNameChange: (name: string) => void;
  onSave: () => void;
  filterAST: FilterGroupNode;
}

export function SaveFilterDialog({
  open,
  onClose,
  filterName,
  onFilterNameChange,
  onSave,
  filterAST,
}: SaveFilterDialogComponentProps) {
  const conditionCount = countConditions(filterAST);
  const sqlPreview = astToSQLPreview(filterAST);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave();
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Save Filter">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Filter Name</label>
          <input
            type="text"
            value={filterName}
            onChange={(e) => onFilterNameChange(e.target.value)}
            placeholder="e.g. Active Admin Users"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
            Preview
          </p>
          <code className="text-xs text-neutral-600 font-mono">
            {conditionCount} conditions — WHERE {sqlPreview || '(empty)'}
          </code>
        </div>

        <div className="flex justify-end gap-2">
          <BaseButton variant="secondary" onClick={onClose}>
            Cancel
          </BaseButton>
          <BaseButton onClick={onSave} disabled={!filterName.trim()}>
            Save Filter
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  );
}

SaveFilterDialog.displayName = 'SaveFilterDialog';
