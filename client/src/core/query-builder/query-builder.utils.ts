// ============================================================
// Query Builder Utils - AST helpers, field resolver, converters
// Phase 3 – Query Builder: Relation field support + utilities
// ============================================================

import type { EntitySchema, FieldSchema, SchemaRegistry } from '../metadata/schema.types';
import type {
  FilterNode,
  FilterGroupNode,
  FilterConditionNode,
  FilterOperator,
  QueryField,
} from './query-builder.types';
import type {
  FilterGroup,
  FilterCondition,
  FilterOperator as FlatFilterOperator,
} from '../../types';
import { getDefaultOperator } from './operator.config';

// ─── Factory Helpers ─────────────────────────────────────────

/** Create empty AND group */
export function createEmptyGroup(operator: 'AND' | 'OR' = 'AND'): FilterGroupNode {
  return { type: 'group', operator, children: [] };
}

/** Create empty condition with smart defaults for field type */
export function createEmptyCondition(
  fields: QueryField[],
  fieldName?: string,
): FilterConditionNode {
  const field = fieldName ? (fields.find((f) => f.name === fieldName) ?? fields[0]) : fields[0];

  if (!field) {
    return { type: 'condition', field: '', operator: 'eq', value: '' };
  }

  return {
    type: 'condition',
    field: field.name,
    operator: getDefaultOperator(field.type),
    value: '',
  };
}

// ─── Resolve Query Fields from EntitySchema ──────────────────

/**
 * Resolve flat QueryField[] from EntitySchema, including relation dot-paths.
 * E.g. orders schema → ["id", "order_number", "user_id", "user.username", "user.email", ...]
 *
 * @param schema - Source entity schema
 * @param registry - Schema registry (to resolve relation targets)
 * @param maxDepth - Max relation nesting depth (default: 2)
 * @param prefix - Internal: current dot-path prefix
 * @param parentLabel - Internal: parent label for concatenation
 * @param depth - Internal: current depth
 */
export function resolveQueryFields(
  schema: EntitySchema,
  registry?: SchemaRegistry,
  maxDepth = 2,
  prefix = '',
  parentLabel = '',
  depth = 0,
): QueryField[] {
  const fields: QueryField[] = [];

  for (const field of schema.fields) {
    // Skip non-filterable fields
    if (field.filterable === false && !field.isPrimary) continue;

    const fullName = prefix ? `${prefix}.${field.name}` : field.name;
    const displayLabel = parentLabel ? `${parentLabel} → ${field.label}` : field.label;

    fields.push({
      name: fullName,
      label: displayLabel,
      type: field.type,
      options: field.options,
      relation: field.relation,
      isRelationPath: depth > 0,
      group: depth > 0 ? parentLabel : undefined,
    });

    // Recurse into relation target entity
    if (field.type === 'relation' && field.relation && registry && depth < maxDepth) {
      const targetSchema = registry[field.relation.target];
      if (targetSchema) {
        const relationPrefix = prefix
          ? `${prefix}.${field.relation.target}`
          : field.relation.target;
        const relationLabel = displayLabel;
        const nested = resolveQueryFields(
          targetSchema,
          registry,
          maxDepth,
          relationPrefix,
          relationLabel,
          depth + 1,
        );
        // Filter to only include basic fields from the relation (not further nested relations)
        fields.push(...nested.filter((f) => !f.relation || depth + 1 < maxDepth));
      }
    }
  }

  return fields;
}

/**
 * Simple field resolution from FieldSchema[] (without schema registry).
 * Only returns direct fields, no relation paths.
 */
export function fieldsToQueryFields(fieldSchemas: FieldSchema[]): QueryField[] {
  return fieldSchemas
    .filter((f) => f.filterable !== false || f.isPrimary)
    .map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      options: f.options,
      relation: f.relation,
      isRelationPath: false,
    }));
}

// ─── AST ↔ Flat Filter Converters ───────────────────────────

/**
 * Convert typed AST (FilterGroupNode) → flat format (FilterGroup)
 * For backward compatibility with BaseFilterBar and existing CRUD hooks
 */
export function astToFlatFilter(node: FilterGroupNode): FilterGroup {
  return {
    logic: node.operator,
    conditions: node.children.map((child) => {
      if (child.type === 'group') {
        return astToFlatFilter(child);
      }
      return {
        field: child.field,
        operator: mapOperatorToFlat(child.operator),
        value: child.value,
      } as FilterCondition;
    }),
  };
}

/**
 * Convert flat format (FilterGroup) → typed AST (FilterGroupNode)
 * For migrating existing filters to the new AST format
 */
export function flatFilterToAST(group: FilterGroup): FilterGroupNode {
  return {
    type: 'group',
    operator: group.logic,
    children: group.conditions.map((cond) => {
      if ('logic' in cond) {
        return flatFilterToAST(cond as FilterGroup);
      }
      const fc = cond as FilterCondition;
      return {
        type: 'condition',
        field: fc.field,
        operator: mapOperatorFromFlat(fc.operator),
        value: fc.value,
      } as FilterConditionNode;
    }),
  };
}

/** Map AST operator → flat operator (handle contains→like, etc.) */
function mapOperatorToFlat(op: FilterOperator): FlatFilterOperator {
  switch (op) {
    case 'contains':
    case 'startsWith':
    case 'endsWith':
      return 'like';
    case 'before':
      return 'lt';
    case 'after':
      return 'gt';
    default:
      return op as FlatFilterOperator;
  }
}

/** Map flat operator → AST operator */
function mapOperatorFromFlat(op: FlatFilterOperator): FilterOperator {
  // Flat format uses 'like' for all text matching; default to 'contains'
  if (op === 'like') return 'contains';
  return op as FilterOperator;
}

// ─── AST Validation ──────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a filter AST tree
 * - Checks for empty groups
 * - Checks for conditions without fields
 * - Checks for conditions that require values but have none
 */
export function validateAST(node: FilterNode, availableFields?: QueryField[]): ValidationResult {
  const errors: string[] = [];

  function walk(n: FilterNode, path: string) {
    if (n.type === 'group') {
      if (n.children.length === 0) {
        errors.push(`${path}: Empty group`);
      }
      n.children.forEach((child, i) => walk(child, `${path}[${i}]`));
    } else {
      if (!n.field) {
        errors.push(`${path}: Missing field`);
      }
      if (availableFields && !availableFields.some((f) => f.name === n.field)) {
        errors.push(`${path}: Unknown field "${n.field}"`);
      }
      const requiresValue = n.operator !== 'isNull' && n.operator !== 'isNotNull';
      if (requiresValue && (n.value === '' || n.value === null || n.value === undefined)) {
        errors.push(`${path}: Missing value for operator "${n.operator}"`);
      }
    }
  }

  walk(node, 'root');
  return { valid: errors.length === 0, errors };
}

// ─── AST to SQL Preview ─────────────────────────────────────

/**
 * Generate a human-readable SQL-like preview of the filter AST
 * (for display only, NOT for execution)
 */
export function astToSQLPreview(node: FilterNode): string {
  if (node.type === 'group') {
    if (node.children.length === 0) return '(empty)';
    const parts = node.children.map((c) => astToSQLPreview(c));
    return `(${parts.join(` ${node.operator} `)})`;
  }

  const { field, operator, value } = node;
  switch (operator) {
    case 'eq':
      return `${field} = '${value}'`;
    case 'neq':
      return `${field} != '${value}'`;
    case 'gt':
      return `${field} > ${value}`;
    case 'gte':
      return `${field} >= ${value}`;
    case 'lt':
      return `${field} < ${value}`;
    case 'lte':
      return `${field} <= ${value}`;
    case 'contains':
      return `${field} LIKE '%${value}%'`;
    case 'startsWith':
      return `${field} LIKE '${value}%'`;
    case 'endsWith':
      return `${field} LIKE '%${value}'`;
    case 'in':
      return `${field} IN (${Array.isArray(value) ? value.map((v: string) => `'${v}'`).join(', ') : value})`;
    case 'notIn':
      return `${field} NOT IN (${Array.isArray(value) ? value.map((v: string) => `'${v}'`).join(', ') : value})`;
    case 'isNull':
      return `${field} IS NULL`;
    case 'isNotNull':
      return `${field} IS NOT NULL`;
    case 'between':
      return `${field} BETWEEN ${Array.isArray(value) ? `${value[0]} AND ${value[1]}` : value}`;
    case 'before':
      return `${field} < '${value}'`;
    case 'after':
      return `${field} > '${value}'`;
    default:
      return `${field} ${operator} '${value}'`;
  }
}

// ─── Count Helpers ───────────────────────────────────────────

/** Count total conditions in the AST tree */
export function countConditions(node: FilterNode): number {
  if (node.type === 'condition') return 1;
  return node.children.reduce((sum, child) => sum + countConditions(child), 0);
}

/** Get max depth of the AST tree */
export function getMaxDepth(node: FilterNode, current = 0): number {
  if (node.type === 'condition') return current;
  if (node.children.length === 0) return current;
  return Math.max(...node.children.map((c) => getMaxDepth(c, current + 1)));
}
