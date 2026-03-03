import React, { useState } from 'react';
import { BaseButton } from './BaseButton';
import type { ColumnConfig, FilterCondition, FilterGroup, FilterOperator } from '../../types';

// ============================================================
// BaseFilterBar - Quick filter + advanced filter builder
// ============================================================
export interface BaseFilterBarProps {
  columns: ColumnConfig[];
  onFilter: (filter: FilterGroup | null) => void;
  onSearch: (text: string) => void;
  searchValue?: string;
}

export function BaseFilterBar({
  columns,
  onFilter,
  onSearch,
  searchValue = '',
}: BaseFilterBarProps) {
  const filterableColumns = columns.filter((col) => col.filterable);
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addCondition = () => {
    const first = filterableColumns[0];
    if (!first) return;
    setConditions([...conditions, { field: first.name, operator: 'eq', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  const applyFilters = () => {
    if (conditions.length === 0) {
      onFilter(null);
      return;
    }
    onFilter({
      logic: 'AND',
      conditions: conditions.filter((c) => c.value !== ''),
    });
  };

  const clearFilters = () => {
    setConditions([]);
    onFilter(null);
  };

  const operatorOptions: Array<{ label: string; value: FilterOperator }> = [
    { label: '=', value: 'eq' },
    { label: '≠', value: 'neq' },
    { label: '>', value: 'gt' },
    { label: '>=', value: 'gte' },
    { label: '<', value: 'lt' },
    { label: '<=', value: 'lte' },
    { label: 'Contains', value: 'like' },
    { label: 'Is Null', value: 'isNull' },
  ];

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <BaseButton variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Hide Filters' : 'Filters'}
        </BaseButton>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 space-y-2 bg-neutral-50">
          {conditions.map((cond, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={cond.field}
                onChange={(e) => updateCondition(idx, { field: e.target.value })}
                className="border rounded px-2 py-1.5 text-sm"
              >
                {filterableColumns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.label}
                  </option>
                ))}
              </select>

              <select
                value={cond.operator}
                onChange={(e) =>
                  updateCondition(idx, { operator: e.target.value as FilterOperator })
                }
                className="border rounded px-2 py-1.5 text-sm"
              >
                {operatorOptions.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {cond.operator !== 'isNull' && cond.operator !== 'isNotNull' && (
                <input
                  type="text"
                  value={cond.value}
                  onChange={(e) => updateCondition(idx, { value: e.target.value })}
                  className="flex-1 border rounded px-2 py-1.5 text-sm"
                  placeholder="Value"
                />
              )}

              <button
                onClick={() => removeCondition(idx)}
                className="text-red-400 hover:text-red-600 text-lg"
              >
                ×
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <BaseButton size="sm" variant="ghost" onClick={addCondition}>
              + Add Filter
            </BaseButton>
            <BaseButton size="sm" variant="primary" onClick={applyFilters}>
              Apply
            </BaseButton>
            {conditions.length > 0 && (
              <BaseButton size="sm" variant="ghost" onClick={clearFilters}>
                Clear
              </BaseButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
