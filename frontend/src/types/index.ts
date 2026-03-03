// ============================================================
// Core Types — Shared across entire frontend
// Theo rule: base_ui.md, Filter + Query Builder UI.md, Relation_nested CRUD.md
// ============================================================

/* ────── DB Schema types ────── */

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  defaultValue?: string;
  maxLength?: number;
}

export interface RelationSchema {
  type: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY' | 'SELF';
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  relations: RelationSchema[];
  primaryKey: string[];
}

/* ────── Pagination ────── */

export interface PaginatedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/* ────── Filter / Query AST ────── */

export type FilterOperator =
  | 'eq' | 'neq'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'like' | 'notLike'
  | 'in' | 'notIn'
  | 'isNull' | 'isNotNull'
  | 'between';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface FilterGroup {
  logic: 'AND' | 'OR';
  conditions: Array<FilterCondition | FilterGroup>;
}

export type FilterNode = FilterCondition | FilterGroup;

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: SortOption[];
  filter?: FilterGroup;
  search?: string;
  include?: string[];          // nested relation paths
  select?: string[];           // projection
}

/* ────── Entity Config (metadata-driven UI) ────── */

export type FieldType =
  | 'text' | 'number' | 'date' | 'datetime'
  | 'boolean' | 'select' | 'multiselect'
  | 'textarea' | 'email' | 'password'
  | 'url' | 'json' | 'file' | 'image'
  | 'relation' | 'color';

export interface ColumnConfig {
  name: string;
  label: string;
  type: FieldType;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  editable: boolean;
  required: boolean;
  width?: number;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  /** Relation field config */
  relation?: {
    targetEntity: string;
    displayField: string;
    valueField?: string;
  };
  /** Render override */
  render?: (value: any, row: any) => React.ReactNode;
}

export interface RelationConfig {
  name: string;
  label: string;
  type: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY' | 'SELF';
  targetEntity: string;
  displayField: string;
  sourceColumn: string;
  targetColumn: string;
  inline?: boolean;            // show inline in form
}

export interface EntityConfig {
  name: string;
  label: string;
  icon?: string;
  description?: string;
  primaryKey?: string;
  permissions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export?: boolean;
    import?: boolean;
  };
  columns: ColumnConfig[];
  relations?: RelationConfig[];
  /** Default sort when page loads */
  defaultSort?: SortOption[];
  /** Default page size */
  defaultPageSize?: number;
}

/* ────── Connection ────── */

export interface ConnectionInfo {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'oracle';
  host: string;
  port: number;
  database: string;
  username?: string;
  status: 'connected' | 'disconnected' | 'error';
  createdAt?: string;
}

/* ────── AI Chat ────── */

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  proposedChanges?: FileChange[];
  skillUsed?: string;
  plan?: string[];
  timestamp: Date;
}

export interface FileChange {
  filePath: string;
  action: 'create' | 'update' | 'delete';
  content?: string;
}

/* ────── Toast / Notification ────── */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/* ────── Route meta ────── */

export interface RouteMeta {
  title: string;
  requireAuth?: boolean;
  roles?: string[];
}

/* ────── User / Auth ────── */

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  avatar?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}
