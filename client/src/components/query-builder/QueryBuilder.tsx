import React, { useMemo } from 'react';
import type { QueryBuilderProps, FilterGroupNode, QueryField } from '../../core/query-builder';
import {
  createEmptyGroup,
  countConditions,
  astToSQLPreview,
  validateAST,
} from '../../core/query-builder';
import { ConditionGroup } from './ConditionGroup';

// ============================================================
// QueryBuilder - Production visual query builder
// Supports: typed AST, metadata-driven operators, nested AND/OR,
// relation field dot-paths, SQL preview, validation
// Phase 3 – Query Builder
// ============================================================

export function QueryBuilder({
  fields = [],
  value,
  onChange,
  maxDepth = 3,
  disabled = false,
  compact = false,
  showPreview = false,
  className = '',
}: QueryBuilderProps) {
  // Stats for display
  const conditionCount = useMemo(() => countConditions(value), [value]);
  const validation = useMemo(() => validateAST(value, fields), [value, fields]);

  // SQL preview
  const sqlPreview = useMemo(
    () => (showPreview ? astToSQLPreview(value) : ''),
    [showPreview, value],
  );

  // ── Clear all conditions ──
  const handleClear = () => {
    onChange(createEmptyGroup(value.operator));
  };

  return (
    <div className={`border border-neutral-200 rounded-lg bg-neutral-50 ${className}`}>
      {/* ── Header ── */}
      <div
        className={`flex items-center justify-between gap-3 border-b border-neutral-200 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-700">Query Builder</span>
          {conditionCount > 0 && (
            <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
              {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
            </span>
          )}
          {!validation.valid && conditionCount > 0 && (
            <span className="text-xs text-amber-600" title={validation.errors.join('\n')}>
              ⚠ {validation.errors.length} issue{validation.errors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {conditionCount > 0 && !disabled && (
          <button
            onClick={handleClear}
            className="text-xs text-neutral-500 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Builder Body ── */}
      <div className={compact ? 'p-3' : 'p-4'}>
        <ConditionGroup
          group={value}
          fields={fields}
          onChange={onChange}
          depth={0}
          maxDepth={maxDepth}
          disabled={disabled}
        />
      </div>

      {/* ── SQL Preview (optional) ── */}
      {showPreview && conditionCount > 0 && (
        <div className="border-t border-neutral-200 px-4 py-2 bg-neutral-100 rounded-b-lg">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Preview
            </span>
          </div>
          <code className="text-xs text-neutral-600 font-mono block mt-1 break-all">
            WHERE {sqlPreview}
          </code>
        </div>
      )}
    </div>
  );
}

// ── Re-export helpers for convenience ──
export type { QueryBuilderProps, FilterGroupNode, QueryField };
