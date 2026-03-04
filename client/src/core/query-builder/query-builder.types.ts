// ============================================================
// Query Builder Types - Frontend AST aligned with Server
// Phase 3 – Query Builder: AST Format
// ============================================================

import type { FieldType, RelationFieldSchema, FieldOption } from '../metadata/schema.types';

// ─── Filter Operators ────────────────────────────────────────
/** All supported filter operators (aligned with server filter.types.ts) */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'between'
  | 'before'
  | 'after';

// ─── Filter AST Nodes ────────────────────────────────────────
/** FilterNode = group | condition (discriminated union via `type`) */
export type FilterNode = FilterGroupNode | FilterConditionNode;

/** Group node: combines children with AND/OR */
export interface FilterGroupNode {
  type: 'group';
  operator: 'AND' | 'OR';
  children: FilterNode[];
}

/** Condition node: single field comparison */
export interface FilterConditionNode {
  type: 'condition';
  field: string;
  operator: FilterOperator;
  value: any;
}

// ─── Query Field (for UI rendering) ─────────────────────────
/** Flattened field descriptor for query builder field selector */
export interface QueryField {
  /** Field path (dot-notation for relations: "user.name") */
  name: string;
  /** Display label (e.g. "Customer → Username") */
  label: string;
  /** Field type (drives operator selection) */
  type: FieldType;
  /** Select/multiselect options */
  options?: FieldOption[];
  /** Relation config (when type = 'relation') */
  relation?: RelationFieldSchema;
  /** Whether this is a relation path field */
  isRelationPath?: boolean;
  /** Group label for option grouping in select */
  group?: string;
}

// ─── Operator Config ─────────────────────────────────────────
/** Single operator definition for UI */
export interface OperatorDef {
  /** Operator value sent to server */
  value: FilterOperator;
  /** Display label */
  label: string;
  /** Whether operator requires a value input */
  requiresValue: boolean;
  /** Type of value input to render */
  valueType:
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'multi'
    | 'between-number'
    | 'between-date'
    | 'none';
}

// ─── QueryBuilder Props ──────────────────────────────────────
/** Props for the main QueryBuilder component */
export interface QueryBuilderProps {
  /** Available fields (override auto-resolved from schema) */
  fields?: QueryField[];
  /** Current filter AST */
  value: FilterGroupNode;
  /** Callback when filter changes */
  onChange: (filter: FilterGroupNode) => void;
  /** Max nesting depth (default: 3) */
  maxDepth?: number;
  /** Read-only mode */
  disabled?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Show SQL preview panel */
  showPreview?: boolean;
  /** Custom class name */
  className?: string;
}

// ─── ConditionGroup Props ────────────────────────────────────
export interface ConditionGroupProps {
  group: FilterGroupNode;
  fields: QueryField[];
  onChange: (group: FilterGroupNode) => void;
  depth: number;
  maxDepth: number;
  disabled?: boolean;
}

// ─── ConditionRow Props ──────────────────────────────────────
export interface ConditionRowProps {
  condition: FilterConditionNode;
  fields: QueryField[];
  onChange: (condition: FilterConditionNode) => void;
  onRemove: () => void;
  disabled?: boolean;
}
