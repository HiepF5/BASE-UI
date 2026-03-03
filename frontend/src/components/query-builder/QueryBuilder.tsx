import React, { useCallback } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { cn, deepClone, createEmptyFilter, createCondition, isFilterGroup } from '@/core/utils';
import { BaseButton } from '../base/BaseButton';
import type { FilterGroup, FilterCondition, FilterNode, FilterOperator, ColumnConfig } from '@/types';

/* ═══════════════════════════════════════════════════════════
   QueryBuilder — Nested AND/OR filter builder
   Theo rule: Filter + Query Builder UI.md
   ═══════════════════════════════════════════════════════════ */

/* ── Operator labels ── */
const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'eq',        label: '=' },
  { value: 'neq',       label: '≠' },
  { value: 'gt',        label: '>' },
  { value: 'gte',       label: '≥' },
  { value: 'lt',        label: '<' },
  { value: 'lte',       label: '≤' },
  { value: 'like',      label: 'Chứa' },
  { value: 'notLike',   label: 'Không chứa' },
  { value: 'in',        label: 'Trong' },
  { value: 'notIn',     label: 'Ngoài' },
  { value: 'isNull',    label: 'Rỗng' },
  { value: 'isNotNull', label: 'Có giá trị' },
  { value: 'between',   label: 'Khoảng' },
];

const NO_VALUE_OPS: FilterOperator[] = ['isNull', 'isNotNull'];

/* ── Props ── */
export interface QueryBuilderProps {
  value: FilterGroup;
  onChange: (group: FilterGroup) => void;
  columns: ColumnConfig[];
  maxDepth?: number;
  className?: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  value,
  onChange,
  columns,
  maxDepth = 3,
  className,
}) => {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-gray-50 p-4', className)}>
      <GroupNode
        group={value}
        onChange={onChange}
        columns={columns}
        depth={0}
        maxDepth={maxDepth}
        onRemove={undefined}
      />
    </div>
  );
};

/* ══ Group (AND / OR) ══ */

interface GroupNodeProps {
  group: FilterGroup;
  onChange: (group: FilterGroup) => void;
  columns: ColumnConfig[];
  depth: number;
  maxDepth: number;
  onRemove: (() => void) | undefined;
}

const GroupNode: React.FC<GroupNodeProps> = ({
  group,
  onChange,
  columns,
  depth,
  maxDepth,
  onRemove,
}) => {
  const update = (partial: Partial<FilterGroup>) =>
    onChange({ ...group, ...partial });

  const updateCondition = (index: number, node: FilterNode) => {
    const conditions = [...group.conditions];
    conditions[index] = node;
    update({ conditions });
  };

  const removeCondition = (index: number) => {
    update({ conditions: group.conditions.filter((_, i) => i !== index) });
  };

  const addCondition = () => {
    const firstCol = columns[0]?.name ?? '';
    update({ conditions: [...group.conditions, createCondition(firstCol)] });
  };

  const addGroup = () => {
    if (depth >= maxDepth) return;
    const subGroup: FilterGroup = {
      logic: group.logic === 'AND' ? 'OR' : 'AND',
      conditions: [createCondition(columns[0]?.name ?? '')],
    };
    update({ conditions: [...group.conditions, subGroup] });
  };

  const toggleLogic = () =>
    update({ logic: group.logic === 'AND' ? 'OR' : 'AND' });

  return (
    <div className={cn('space-y-2', depth > 0 && 'ml-4 border-l-2 border-primary-200 pl-4')}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLogic}
          className={cn(
            'rounded px-2 py-0.5 text-xs font-bold transition-colors',
            group.logic === 'AND'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-warning-100 text-warning-700',
          )}
        >
          {group.logic}
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <BaseButton type="button" variant="ghost" size="xs" onClick={addCondition}>
            <Plus className="h-3 w-3" /> Điều kiện
          </BaseButton>
          {depth < maxDepth && (
            <BaseButton type="button" variant="ghost" size="xs" onClick={addGroup}>
              <Plus className="h-3 w-3" /> Nhóm
            </BaseButton>
          )}
          {onRemove && (
            <BaseButton type="button" variant="ghost" size="xs" onClick={onRemove} className="text-danger-500">
              <Trash2 className="h-3 w-3" />
            </BaseButton>
          )}
        </div>
      </div>

      {/* Conditions */}
      {group.conditions.map((node, idx) =>
        isFilterGroup(node) ? (
          <GroupNode
            key={idx}
            group={node}
            onChange={(g) => updateCondition(idx, g)}
            columns={columns}
            depth={depth + 1}
            maxDepth={maxDepth}
            onRemove={() => removeCondition(idx)}
          />
        ) : (
          <ConditionRow
            key={idx}
            condition={node}
            columns={columns}
            onChange={(c) => updateCondition(idx, c)}
            onRemove={() => removeCondition(idx)}
          />
        ),
      )}

      {group.conditions.length === 0 && (
        <p className="text-xs text-gray-400 italic">Chưa có điều kiện nào</p>
      )}
    </div>
  );
};

/* ══ Condition Row ══ */

interface ConditionRowProps {
  condition: FilterCondition;
  columns: ColumnConfig[];
  onChange: (c: FilterCondition) => void;
  onRemove: () => void;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  columns,
  onChange,
  onRemove,
}) => {
  const inputClass =
    'h-8 rounded border border-gray-300 bg-white px-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  const showValue = !NO_VALUE_OPS.includes(condition.operator);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Field */}
      <select
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
        className={cn(inputClass, 'min-w-[140px]')}
      >
        <option value="">— Cột —</option>
        {columns
          .filter((c) => c.filterable !== false)
          .map((c) => (
            <option key={c.name} value={c.name}>{c.label}</option>
          ))}
      </select>

      {/* Operator */}
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as FilterOperator })}
        className={cn(inputClass, 'min-w-[100px]')}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* Value */}
      {showValue && (
        <input
          type="text"
          value={condition.value ?? ''}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Giá trị"
          className={cn(inputClass, 'flex-1 min-w-[120px]')}
        />
      )}

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-danger-500 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
