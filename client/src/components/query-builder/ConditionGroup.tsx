import React from 'react';
import {
  createEmptyCondition,
  createEmptyGroup,
  type ConditionGroupProps,
  type FilterGroupNode,
  type FilterConditionNode,
  type FilterNode,
} from '../../core/query-builder';
import { ConditionRow } from './ConditionRow';

// ============================================================
// ConditionGroup - Recursive AND/OR group with nested children
// Phase 3 – Query Builder: ConditionGroup + Nested AND/OR
// ============================================================

/** Depth-based left border colors for visual nesting */
const DEPTH_COLORS = [
  'border-primary-300',
  'border-blue-300',
  'border-green-300',
  'border-amber-300',
  'border-purple-300',
];

/** Depth-based badge colors */
const BADGE_COLORS = [
  'bg-primary-100 text-primary-700 hover:bg-primary-200',
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'bg-green-100 text-green-700 hover:bg-green-200',
  'bg-amber-100 text-amber-700 hover:bg-amber-200',
  'bg-purple-100 text-purple-700 hover:bg-purple-200',
];

export const ConditionGroup = React.memo(function ConditionGroup({
  group,
  fields,
  onChange,
  depth,
  maxDepth,
  disabled,
}: ConditionGroupProps) {
  const borderColor = DEPTH_COLORS[depth % DEPTH_COLORS.length];
  const badgeColor = BADGE_COLORS[depth % BADGE_COLORS.length];

  // ── Toggle AND ↔ OR ──
  const toggleOperator = () => {
    onChange({ ...group, operator: group.operator === 'AND' ? 'OR' : 'AND' });
  };

  // ── Add new condition ──
  const addCondition = () => {
    if (fields.length === 0) return;
    const newCondition = createEmptyCondition(fields);
    onChange({ ...group, children: [...group.children, newCondition] });
  };

  // ── Add nested group ──
  const addGroup = () => {
    const newGroup = createEmptyGroup('AND');
    onChange({ ...group, children: [...group.children, newGroup] });
  };

  // ── Remove child at index ──
  const removeAt = (index: number) => {
    onChange({ ...group, children: group.children.filter((_, i) => i !== index) });
  };

  // ── Update child at index ──
  const updateAt = (index: number, updated: FilterNode) => {
    onChange({
      ...group,
      children: group.children.map((c, i) => (i === index ? updated : c)),
    });
  };

  return (
    <div className={`space-y-2 ${depth > 0 ? `ml-3 pl-3 border-l-2 ${borderColor}` : ''}`}>
      {/* ── Group Header ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Operator Toggle Badge */}
        <button
          onClick={toggleOperator}
          disabled={disabled}
          className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${badgeColor}
            disabled:opacity-50 disabled:cursor-not-allowed`}
          title={`Click to switch to ${group.operator === 'AND' ? 'OR' : 'AND'}`}
        >
          {group.operator}
        </button>

        {/* Add Condition */}
        <button
          onClick={addCondition}
          disabled={disabled || fields.length === 0}
          className="text-xs text-neutral-500 hover:text-primary-600 px-2 py-1 rounded
            hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Condition
        </button>

        {/* Add Group (only if under maxDepth) */}
        {depth < maxDepth && (
          <button
            onClick={addGroup}
            disabled={disabled}
            className="text-xs text-neutral-500 hover:text-primary-600 px-2 py-1 rounded
              hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Group
          </button>
        )}

        {/* Depth indicator */}
        {depth > 0 && <span className="text-[10px] text-neutral-400">depth {depth}</span>}
      </div>

      {/* ── Children ── */}
      {group.children.length === 0 && (
        <div className="text-xs text-neutral-400 italic pl-1">
          No conditions. Click "+ Condition" to add one.
        </div>
      )}

      {group.children.map((child, idx) => {
        if (child.type === 'group') {
          return (
            <div key={idx} className="relative group/item">
              {/* Remove Group Button */}
              <button
                onClick={() => removeAt(idx)}
                disabled={disabled}
                className="absolute -left-1 top-0 text-neutral-400 hover:text-red-500 text-sm
                  opacity-0 group-hover/item:opacity-100 transition-opacity z-10
                  disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove group"
              >
                ×
              </button>
              <ConditionGroup
                group={child as FilterGroupNode}
                fields={fields}
                onChange={(g) => updateAt(idx, g)}
                depth={depth + 1}
                maxDepth={maxDepth}
                disabled={disabled}
              />
            </div>
          );
        }

        return (
          <ConditionRow
            key={idx}
            condition={child as FilterConditionNode}
            fields={fields}
            onChange={(c) => updateAt(idx, c)}
            onRemove={() => removeAt(idx)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
});

ConditionGroup.displayName = 'ConditionGroup';
