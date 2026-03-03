// ============================================================
// Core Types - Shared across UI
// ============================================================

/** Column metadata from DB schema */
export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  defaultValue?: string;
  maxLength?: number;
}

/** Relation metadata */
export interface RelationSchema {
  type: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

/** Table schema from API */
export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  relations: RelationSchema[];
  primaryKey: string[];
}

/** Pagination result wrapper */
export interface PaginatedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Filter operators */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'between';

/** Single filter condition */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

/** Filter group (AND/OR) */
export interface FilterGroup {
  logic: 'AND' | 'OR';
  conditions: Array<FilterCondition | FilterGroup>;
}

/** Sort option */
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

/** Query options for CRUD API calls */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: SortOption[];
  filter?: FilterGroup;
  search?: string;
  include?: string[];
}

/** Entity config for metadata-driven UI */
export interface EntityConfig {
  name: string;
  label: string;
  icon?: string;
  permissions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  columns: ColumnConfig[];
  relations?: RelationConfig[];
}

/** Column configuration for UI rendering */
export interface ColumnConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'password';
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  editable: boolean;
  required: boolean;
  width?: number;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/** Relation config for nested CRUD */
export interface RelationConfig {
  name: string;
  label: string;
  type: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
  targetEntity: string;
  displayField: string;
}

/** DB Connection */
export interface ConnectionInfo {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'oracle';
  host: string;
  port: number;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
}
