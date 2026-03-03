// ============================================================
// Filter Types - Filter AST cho Query Builder
// ============================================================

export type FilterNode = FilterGroup | FilterCondition;

export interface FilterGroup {
  type: 'group';
  operator: 'AND' | 'OR';
  children: FilterNode[];
}

export interface FilterCondition {
  type: 'condition';
  field: string;
  operator: FilterOperator;
  value: any;
}

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

export interface ParsedQuery {
  where: Record<string, any>;
  params: any[];
}
