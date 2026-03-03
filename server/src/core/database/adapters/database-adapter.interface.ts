import {
  DBConfig,
  ColumnSchema,
  QueryOptions,
  PaginationResult,
} from '../types/db.types';

// ============================================================
// DatabaseAdapter Interface - Mọi DB adapter phải implement
// ============================================================
export interface DatabaseAdapter {
  connect(config: DBConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Schema
  getTables(): Promise<string[]>;
  getSchema(table: string): Promise<ColumnSchema[]>;
  getPrimaryKey(table: string): Promise<string>;
  getForeignKeys(table: string): Promise<Array<{ column: string; foreignTable: string; foreignColumn: string }>>;

  // CRUD
  findAll(table: string, options: QueryOptions): Promise<PaginationResult<any>>;
  findById(table: string, id: any, primaryKey: string): Promise<any>;
  insert(table: string, data: Record<string, any>): Promise<any>;
  update(table: string, id: any, data: Record<string, any>, primaryKey: string): Promise<any>;
  delete(table: string, id: any, primaryKey: string): Promise<void>;

  // Raw query
  executeRaw(sql: string, params?: any[]): Promise<any>;

  // Transaction
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
