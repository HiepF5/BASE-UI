import { DatabaseAdapter } from './database-adapter.interface';
import {
  DBConfig,
  ColumnSchema,
  QueryOptions,
  PaginationResult,
} from '../types/db.types';

// ============================================================
// BaseAdapter - Abstract class chứa logic chung
// ============================================================
export abstract class BaseAdapter implements DatabaseAdapter {
  protected client: any;
  protected connected = false;

  abstract connect(config: DBConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract getTables(): Promise<string[]>;
  abstract getSchema(table: string): Promise<ColumnSchema[]>;
  abstract getPrimaryKey(table: string): Promise<string>;
  abstract getForeignKeys(table: string): Promise<Array<{ column: string; foreignTable: string; foreignColumn: string }>>;
  abstract findAll(table: string, options: QueryOptions): Promise<PaginationResult<any>>;
  abstract findById(table: string, id: any, primaryKey: string): Promise<any>;
  abstract insert(table: string, data: Record<string, any>): Promise<any>;
  abstract update(table: string, id: any, data: Record<string, any>, primaryKey: string): Promise<any>;
  abstract delete(table: string, id: any, primaryKey: string): Promise<void>;
  abstract executeRaw(sql: string, params?: any[]): Promise<any>;

  isConnected(): boolean {
    return this.connected;
  }

  async beginTransaction(): Promise<void> {
    await this.executeRaw('BEGIN');
  }

  async commit(): Promise<void> {
    await this.executeRaw('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.executeRaw('ROLLBACK');
  }

  /**
   * Validate SQL trước khi execute - Security layer
   */
  protected validateSQL(sql: string): void {
    const upperSQL = sql.toUpperCase().trim();
    const forbidden = ['DROP', 'TRUNCATE'];

    for (const keyword of forbidden) {
      if (upperSQL.includes(keyword)) {
        throw new Error(`Forbidden SQL operation: ${keyword}`);
      }
    }

    // Block DELETE without WHERE
    if (upperSQL.startsWith('DELETE') && !upperSQL.includes('WHERE')) {
      throw new Error('DELETE without WHERE clause is not allowed');
    }

    // Block UPDATE without WHERE
    if (upperSQL.startsWith('UPDATE') && !upperSQL.includes('WHERE')) {
      throw new Error('UPDATE without WHERE clause is not allowed');
    }
  }

  /**
   * Build WHERE clause từ filters
   */
  protected buildWhereClause(
    filters: Record<string, any>,
    startParamIndex = 1,
  ): { clause: string; params: any[]; nextIndex: number } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = startParamIndex;

    for (const [field, value] of Object.entries(filters)) {
      if (value === null) {
        conditions.push(`"${field}" IS NULL`);
      } else if (typeof value === 'object' && value.operator) {
        // Advanced filter: { operator: 'gt', value: 100 }
        const op = this.mapOperator(value.operator);
        conditions.push(`"${field}" ${op} $${paramIndex}`);
        params.push(value.value);
        paramIndex++;
      } else {
        conditions.push(`"${field}" = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
      nextIndex: paramIndex,
    };
  }

  protected mapOperator(op: string): string {
    const mapping: Record<string, string> = {
      eq: '=',
      neq: '!=',
      gt: '>',
      gte: '>=',
      lt: '<',
      lte: '<=',
      like: 'LIKE',
      ilike: 'ILIKE',
      in: 'IN',
      contains: 'ILIKE',
    };
    return mapping[op] || '=';
  }
}
