import React from 'react';
import { BaseButton } from '../../../components/base';
import type { EntitySchema } from '../../../core/metadata/schema.types';

// ============================================================
// EntityHeader - Shows entity info with action buttons
// ============================================================

export interface EntityHeaderComponentProps {
  schema: EntitySchema;
  showFilterPanel: boolean;
  hasActiveFilter: boolean;
  canCreate: boolean;
  onToggleFilter: () => void;
  onCreate: () => void;
}

export function EntityHeader({
  schema,
  showFilterPanel,
  hasActiveFilter,
  canCreate,
  onToggleFilter,
  onCreate,
}: EntityHeaderComponentProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        {schema.icon && <span className="text-2xl">{schema.icon}</span>}
        <div>
          <h2 className="text-lg font-bold text-text-primary">{schema.label}</h2>
          {schema.description && <p className="text-xs text-text-muted">{schema.description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <BaseButton
          size="sm"
          variant={showFilterPanel ? 'primary' : 'outline'}
          onClick={onToggleFilter}
        >
          🔍 Filter
          {hasActiveFilter && (
            <span className="ml-1 bg-primary-200 text-primary-800 text-[10px] px-1.5 py-0.5 rounded-full">
              active
            </span>
          )}
        </BaseButton>
        {canCreate && <BaseButton onClick={onCreate}>+ Create {schema.label}</BaseButton>}
      </div>
    </div>
  );
}

EntityHeader.displayName = 'EntityHeader';
