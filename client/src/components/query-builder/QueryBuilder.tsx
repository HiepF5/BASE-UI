import React, { useState } from 'react';
import { BaseButton } from '../base/BaseButton';
import type { ColumnConfig, FilterCondition, FilterGroup, FilterOperator } from '../../types';

// ============================================================
// QueryBuilder - Advanced visual query builder
// Supports nested AND/OR groups
// ============================================================

interface QueryBuilderProps {
  columns: ColumnConfig[];
  value: FilterGroup;
  onChange: (filter: FilterGroup) => void;
}

export function QueryBuilder({ columns, value, onChange }: QueryBuilderProps) {
  const filterableColumns = columns.filter((c) => c.filterable);

  return (
    <div className="border rounded-lg p-4 bg-neutral-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">Query Builder</span>
      </div>
      <ConditionGroup
        group={value}
        columns={filterableColumns}
        onChange={onChange}
        depth={0}
      />
    </div>
  );
}

// ---- Condition Group (recursive) ----

interface ConditionGroupProps {
  group: FilterGroup;
  columns: ColumnConfig[];
  onChange: (group: FilterGroup) => void;
  depth: number;
}

function ConditionGroup({ group, columns, onChange, depth }: ConditionGroupProps) {
  const toggleLogic = () => {
    onChange({ ...group, logic: group.logic === 'AND' ? 'OR' : 'AND' });
  };

  const addCondition = () => {
    const first = columns[0];
    if (!first) return;
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { field: first.name, operator: 'eq' as FilterOperator, value: '' },
      ],
    });
  };

  const addGroup = () => {
    onChange({
      ...group,
      conditions: [
        ...group.conditions,
        { logic: 'AND', conditions: [] } as FilterGroup,
      ],
    });
  };

  const removeAt = (index: number) => {
    onChange({
      ...group,
      conditions: group.conditions.filter((_, i) => i !== index),
    });
  };

  const updateAt = (index: number, updated: FilterCondition | FilterGroup) => {
    onChange({
      ...group,
      conditions: group.conditions.map((c, i) => (i === index ? updated : c)),
    });
  };

  return (
    <div
      className={`space-y-2 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-primary-200' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLogic}
          className="text-xs font-bold px-2 py-1 rounded bg-primary-100 text-primary-700 hover:bg-primary-200"
        >
          {group.logic}
        </button>
        <BaseButton size="sm" variant="ghost" onClick={addCondition}>
          + Condition
        </BaseButton>
        {depth < 3 && (
          <BaseButton size="sm" variant="ghost" onClick={addGroup}>
            + Group
          </BaseButton>
        )}
      </div>

      {group.conditions.map((cond, idx) => {
        if ('logic' in cond) {
          return (
            <div key={idx} className="relative">
              <button
                onClick={() => removeAt(idx)}
                className="absolute -left-2 top-0 text-red-400 hover:text-red-600 text-sm"
              >
                ×
              </button>
              <ConditionGroup
                group={cond as FilterGroup}
                columns={columns}
                onChange={(g) => updateAt(idx, g)}
                depth={depth + 1}
              />
            </div>
          );
        }

        return (
          <ConditionRow
            key={idx}
            condition={cond as FilterCondition}
            columns={columns}
            onChange={(c) => updateAt(idx, c)}
            onRemove={() => removeAt(idx)}
          />
        );
      })}
    </div>
  );
}

// ---- Single Condition Row ----

interface ConditionRowProps {
  condition: FilterCondition;
  columns: ColumnConfig[];
  onChange: (condition: FilterCondition) => void;
  onRemove: () => void;
}

const OPERATORS: Array<{ label: string; value: FilterOperator }> = [
  { label: '=', value: 'eq' },
  { label: '≠', value: 'neq' },
  { label: '>', value: 'gt' },
  { label: '>=', value: 'gte' },
  { label: '<', value: 'lt' },
  { label: '<=', value: 'lte' },
  { label: 'Contains', value: 'like' },
  { label: 'In', value: 'in' },
  { label: 'Between', value: 'between' },
  { label: 'Is Null', value: 'isNull' },
  { label: 'Is Not Null', value: 'isNotNull' },
];

function ConditionRow({ condition, columns, onChange, onRemove }: ConditionRowProps) {
  const noValueOps: FilterOperator[] = ['isNull', 'isNotNull'];

  return (
    <div className="flex items-center gap-2">
      <select
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
        className="border rounded px-2 py-1.5 text-sm min-w-[120px]"
      >
        {columns.map((col) => (
          <option key={col.name} value={col.name}>
            {col.label}
          </option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as FilterOperator })}
        className="border rounded px-2 py-1.5 text-sm"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {!noValueOps.includes(condition.operator) && (
        <input
          type="text"
          value={condition.value ?? ''}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className="flex-1 border rounded px-2 py-1.5 text-sm"
          placeholder="Value"
        />
      )}

      <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-lg">
        ×
      </button>
    </div>
  );
}
