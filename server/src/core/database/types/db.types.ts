// ============================================================
// Database Types - Chuẩn hóa cho Multi-DB Adapter Pattern
// ============================================================

export type DatabaseType = 'postgres' | 'mysql' | 'oracle';

export interface DBConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  poolSize?: number;
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
  defaultValue?: any;
  maxLength?: number;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface RelationSchema {
  name: string;
  type: 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  target: string;
  foreignKey: string;
  displayField?: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  relations: RelationSchema[];
  primaryKey: string;
}

export interface QueryOptions {
  page: number;
  limit: number;
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  filters?: Record<string, any>;
  search?: string;
  searchFields?: string[];
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DatabaseError {
  type: 'DUPLICATE_KEY' | 'FOREIGN_KEY' | 'NOT_NULL' | 'CONNECTION_ERROR' | 'QUERY_ERROR' | 'UNKNOWN';
  message: string;
  originalError?: any;
}
