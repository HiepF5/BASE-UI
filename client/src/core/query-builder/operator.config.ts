// ============================================================
// Operator Config - Operators mapped per field type
// Phase 3 – Query Builder: Metadata-driven operators
// ============================================================

import type { FieldType } from '../metadata/schema.types';
import type { FilterOperator, OperatorDef } from './query-builder.types';

// ─── All Operator Definitions ────────────────────────────────
const OP = {
  eq: {
    value: 'eq' as FilterOperator,
    label: 'Equals',
    requiresValue: true,
    valueType: 'text' as const,
  },
  neq: {
    value: 'neq' as FilterOperator,
    label: 'Not Equals',
    requiresValue: true,
    valueType: 'text' as const,
  },
  gt: {
    value: 'gt' as FilterOperator,
    label: 'Greater Than',
    requiresValue: true,
    valueType: 'number' as const,
  },
  gte: {
    value: 'gte' as FilterOperator,
    label: 'Greater or Equal',
    requiresValue: true,
    valueType: 'number' as const,
  },
  lt: {
    value: 'lt' as FilterOperator,
    label: 'Less Than',
    requiresValue: true,
    valueType: 'number' as const,
  },
  lte: {
    value: 'lte' as FilterOperator,
    label: 'Less or Equal',
    requiresValue: true,
    valueType: 'number' as const,
  },
  contains: {
    value: 'contains' as FilterOperator,
    label: 'Contains',
    requiresValue: true,
    valueType: 'text' as const,
  },
  startsWith: {
    value: 'startsWith' as FilterOperator,
    label: 'Starts With',
    requiresValue: true,
    valueType: 'text' as const,
  },
  endsWith: {
    value: 'endsWith' as FilterOperator,
    label: 'Ends With',
    requiresValue: true,
    valueType: 'text' as const,
  },
  in: {
    value: 'in' as FilterOperator,
    label: 'In',
    requiresValue: true,
    valueType: 'multi' as const,
  },
  notIn: {
    value: 'notIn' as FilterOperator,
    label: 'Not In',
    requiresValue: true,
    valueType: 'multi' as const,
  },
  isNull: {
    value: 'isNull' as FilterOperator,
    label: 'Is Empty',
    requiresValue: false,
    valueType: 'none' as const,
  },
  isNotNull: {
    value: 'isNotNull' as FilterOperator,
    label: 'Is Not Empty',
    requiresValue: false,
    valueType: 'none' as const,
  },
  between: {
    value: 'between' as FilterOperator,
    label: 'Between',
    requiresValue: true,
    valueType: 'between-number' as const,
  },
  before: {
    value: 'before' as FilterOperator,
    label: 'Before',
    requiresValue: true,
    valueType: 'date' as const,
  },
  after: {
    value: 'after' as FilterOperator,
    label: 'After',
    requiresValue: true,
    valueType: 'date' as const,
  },
  betweenDate: {
    value: 'between' as FilterOperator,
    label: 'Between',
    requiresValue: true,
    valueType: 'between-date' as const,
  },
} satisfies Record<string, OperatorDef>;

// ─── Operators by Field Type ─────────────────────────────────
/** Get available operators for a given field type */
const operatorsByType: Record<string, OperatorDef[]> = {
  // Text types
  text: [OP.eq, OP.neq, OP.contains, OP.startsWith, OP.endsWith, OP.in, OP.isNull, OP.isNotNull],
  email: [OP.eq, OP.neq, OP.contains, OP.startsWith, OP.endsWith, OP.isNull, OP.isNotNull],
  url: [OP.eq, OP.neq, OP.contains, OP.startsWith, OP.isNull, OP.isNotNull],
  phone: [OP.eq, OP.neq, OP.contains, OP.startsWith, OP.isNull, OP.isNotNull],
  password: [OP.isNull, OP.isNotNull],
  textarea: [OP.contains, OP.startsWith, OP.isNull, OP.isNotNull],
  json: [OP.isNull, OP.isNotNull],

  // Numeric
  number: [OP.eq, OP.neq, OP.gt, OP.gte, OP.lt, OP.lte, OP.between, OP.in, OP.isNull, OP.isNotNull],

  // Date/time
  date: [OP.eq, OP.neq, OP.before, OP.after, OP.betweenDate, OP.isNull, OP.isNotNull],
  datetime: [OP.eq, OP.neq, OP.before, OP.after, OP.betweenDate, OP.isNull, OP.isNotNull],

  // Boolean
  boolean: [OP.eq, OP.neq, OP.isNull, OP.isNotNull],

  // Select / enum
  select: [OP.eq, OP.neq, OP.in, OP.notIn, OP.isNull, OP.isNotNull],
  multiselect: [OP.in, OP.notIn, OP.isNull, OP.isNotNull],

  // Relation (FK / ManyToOne / ManyToMany)
  relation: [OP.eq, OP.neq, OP.in, OP.notIn, OP.isNull, OP.isNotNull],
};

/** Default operators (fallback for unknown field types) */
const defaultOperators: OperatorDef[] = [OP.eq, OP.neq, OP.isNull, OP.isNotNull];

/**
 * Get operators for a specific field type.
 * Returns type-appropriate operator definitions.
 */
export function getOperatorsForType(fieldType: FieldType | string): OperatorDef[] {
  return operatorsByType[fieldType] ?? defaultOperators;
}

/**
 * Get default operator for a field type.
 * Smart defaults: text→contains, number→eq, date→eq, boolean→eq, relation→eq
 */
export function getDefaultOperator(fieldType: FieldType | string): FilterOperator {
  switch (fieldType) {
    case 'text':
    case 'email':
    case 'textarea':
    case 'url':
    case 'phone':
      return 'contains';
    case 'number':
    case 'boolean':
    case 'select':
    case 'multiselect':
    case 'relation':
      return 'eq';
    case 'date':
    case 'datetime':
      return 'after';
    default:
      return 'eq';
  }
}

/**
 * Check if an operator requires a value input
 */
export function operatorRequiresValue(op: FilterOperator): boolean {
  return op !== 'isNull' && op !== 'isNotNull';
}

/**
 * Get the OperatorDef for a specific operator value
 */
export function getOperatorDef(op: FilterOperator): OperatorDef | undefined {
  return Object.values(OP).find((def) => def.value === op);
}
