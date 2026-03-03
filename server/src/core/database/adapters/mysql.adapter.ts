import { BaseAdapter } from './base.adapter';
import {
  DBConfig,
  ColumnSchema,
  QueryOptions,
  PaginationResult,
} from '../types/db.types';

// ============================================================
// MysqlAdapter - Concrete adapter cho MySQL
// ============================================================
export class MysqlAdapter extends BaseAdapter {
  private pool: any; // mysql2 Pool

  async connect(config: DBConfig): Promise<void> {
    const mysql = await import('mysql2/promise');
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      connectionLimit: config.poolSize || 10,
    });
    // Test connection
    const conn = await this.pool.getConnection();
    conn.release();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.connected = false;
    }
  }

  async getTables(): Promise<string[]> {
    const [rows] = await this.pool.query('SHOW TABLES');
    return rows.map((row: any) => Object.values(row)[0] as string);
  }

  async getSchema(table: string): Promise<ColumnSchema[]> {
    const [rows] = await this.pool.query(`DESCRIBE \`${table}\``);
    return (rows as any[]).map((row) => ({
      name: row.Field,
      type: this.normalizeType(row.Type),
      nullable: row.Null === 'YES',
      primary: row.Key === 'PRI',
      defaultValue: row.Default,
    }));
  }

  async getPrimaryKey(table: string): Promise<string> {
    const [rows] = await this.pool.query(
      `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'`,
      [table],
    );
    return (rows as any[])[0]?.COLUMN_NAME || 'id';
  }

  async getForeignKeys(
    table: string,
  ): Promise<Array<{ column: string; foreignTable: string; foreignColumn: string }>> {
    const [rows] = await this.pool.query(
      `SELECT
         COLUMN_NAME AS \`column\`,
         REFERENCED_TABLE_NAME AS foreign_table,
         REFERENCED_COLUMN_NAME AS foreign_column
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [table],
    );
    return (rows as any[]).map((row) => ({
      column: row.column,
      foreignTable: row.foreign_table,
      foreignColumn: row.foreign_column,
    }));
  }

  async findAll(table: string, options: QueryOptions): Promise<PaginationResult<any>> {
    const { page = 1, limit = 20, sort, filters, search, searchFields } = options;
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let whereClause = '';
    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([field, value]) => {
        params.push(value);
        return `\`${field}\` = ?`;
      });
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    if (search && searchFields?.length) {
      const searchConditions = searchFields.map((f) => {
        params.push(`%${search}%`);
        return `\`${f}\` LIKE ?`;
      });
      const searchClause = `(${searchConditions.join(' OR ')})`;
      whereClause = whereClause
        ? `${whereClause} AND ${searchClause}`
        : `WHERE ${searchClause}`;
    }

    const orderClause = sort ? `ORDER BY \`${sort.field}\` ${sort.direction}` : '';

    const [countRows] = await this.pool.query(
      `SELECT COUNT(*) as total FROM \`${table}\` ${whereClause}`,
      params,
    );
    const total = (countRows as any[])[0].total;

    const [dataRows] = await this.pool.query(
      `SELECT * FROM \`${table}\` ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return { data: dataRows as any[], total, page, limit };
  }

  async findById(table: string, id: any, primaryKey: string): Promise<any> {
    const [rows] = await this.pool.query(
      `SELECT * FROM \`${table}\` WHERE \`${primaryKey}\` = ?`,
      [id],
    );
    return (rows as any[])[0] || null;
  }

  async insert(table: string, data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?');

    const [result] = await this.pool.query(
      `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(', ')}) VALUES (${placeholders.join(', ')})`,
      values,
    );
    return { id: result.insertId, ...data };
  }

  async update(table: string, id: any, data: Record<string, any>, primaryKey: string): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');

    await this.pool.query(
      `UPDATE \`${table}\` SET ${setClause} WHERE \`${primaryKey}\` = ?`,
      [...values, id],
    );
    return { [primaryKey]: id, ...data };
  }

  async delete(table: string, id: any, primaryKey: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM \`${table}\` WHERE \`${primaryKey}\` = ?`,
      [id],
    );
  }

  async executeRaw(sql: string, params?: any[]): Promise<any> {
    this.validateSQL(sql);
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  private normalizeType(mysqlType: string): string {
    const lower = mysqlType.toLowerCase();
    if (lower.includes('int')) return 'number';
    if (lower.includes('decimal') || lower.includes('float') || lower.includes('double')) return 'number';
    if (lower.includes('varchar') || lower.includes('text') || lower.includes('char')) return 'string';
    if (lower.includes('bool') || lower.includes('tinyint(1)')) return 'boolean';
    if (lower.includes('date') || lower.includes('timestamp')) return 'datetime';
    if (lower.includes('json')) return 'json';
    return 'string';
  }
}
