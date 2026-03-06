import React from 'react';
import { BaseButton } from '../../../components/base';
import { QueryBuilder } from '../../../components/query-builder';
import {
  countConditions,
  type FilterGroupNode,
  type QueryField,
} from '../../../core/query-builder';
import type { SavedFilter } from '../types/example-app.types';

// ============================================================
// FilterPanel - QueryBuilder + Saved Filters
// ============================================================

export interface FilterPanelComponentProps {
  queryFields: QueryField[];
  filterAST: FilterGroupNode;
  onFilterChange: (filter: FilterGroupNode) => void;
  onApply: () => void;
  onClear: () => void;
  onSave: () => void;
  savedFilters: SavedFilter[];
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
}

export function FilterPanel({
  queryFields,
  filterAST,
  onFilterChange,
  onApply,
  onClear,
  onSave,
  savedFilters,
  onLoadFilter,
  onDeleteFilter,
}: FilterPanelComponentProps) {
  const conditionCount = countConditions(filterAST);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      {/* QueryBuilder */}
      <div className="p-4 border-b border-neutral-100">
        <QueryBuilder
          fields={queryFields}
          value={filterAST}
          onChange={onFilterChange}
          maxDepth={3}
          showPreview
        />

        <div className="flex items-center gap-2 mt-3">
          <BaseButton size="sm" onClick={onApply}>
            Apply Filter
          </BaseButton>
          {conditionCount > 0 && (
            <>
              <BaseButton size="sm" variant="secondary" onClick={onClear}>
                Clear
              </BaseButton>
              <BaseButton size="sm" variant="outline" onClick={onSave}>
                💾 Save Filter
              </BaseButton>
            </>
          )}
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="bg-neutral-50 px-4 py-3">
          <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Saved Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((sf) => (
              <div
                key={sf.id}
                className="flex items-center gap-1 bg-white border border-neutral-200 rounded-full px-3 py-1 text-xs"
              >
                <button
                  onClick={() => onLoadFilter(sf)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {sf.name}
                </button>
                <span className="text-neutral-400">({countConditions(sf.filter)})</span>
                <button
                  onClick={() => onDeleteFilter(sf.id)}
                  className="text-neutral-400 hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

FilterPanel.displayName = 'FilterPanel';
