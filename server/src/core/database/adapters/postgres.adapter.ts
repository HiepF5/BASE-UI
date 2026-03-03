import { Pool, PoolConfig } from 'pg';
import { BaseAdapter } from './base.adapter';
import {
  DBConfig,
  ColumnSchema,
  QueryOptions,
  PaginationResult,
} from '../types/db.types';

// ============================================================
// PostgresAdapter - Concrete adapter cho PostgreSQL
// ============================================================
export class PostgresAdapter extends BaseAdapter {
  private pool: Pool;

  async connect(config: DBConfig): Promise<void> {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      max: config.poolSize || 10,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    };

    this.pool = new Pool(poolConfig);
    // Test connection
    const client = await this.pool.connect();
    client.release();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.connected = false;
    }
  }

  async getTables(): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    return result.rows.map((row) => row.tablename);
  }

  async getSchema(table: string): Promise<ColumnSchema[]> {
    const result = await this.pool.query(
      `
      SELECT
        c.column_name AS name,
        c.data_type AS type,
        c.is_nullable = 'YES' AS nullable,
        c.column_default AS default_value,
        c.character_maximum_length AS max_length,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS primary
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = $1
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `,
      [table],
    );

    return result.rows.map((row) => ({
      name: row.name,
      type: this.normalizeType(row.type),
      nullable: row.nullable,
      primary: row.primary,
      defaultValue: row.default_value,
      maxLength: row.max_length,
    }));
  }

  async getPrimaryKey(table: string): Promise<string> {
    const result = await this.pool.query(
      `
      SELECT ku.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku
        ON tc.constraint_name = ku.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
    `,
      [table],
    );
    return result.rows[0]?.column_name || 'id';
  }

  async getForeignKeys(
    table: string,
  ): Promise<Array<{ column: string; foreignTable: string; foreignColumn: string }>> {
    const result = await this.pool.query(
      `
      SELECT
        kcu.column_name AS column,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
    `,
      [table],
    );
    return result.rows.map((row) => ({
      column: row.column,
      foreignTable: row.foreign_table,
      foreignColumn: row.foreign_column,
    }));
  }

  async findAll(table: string, options: QueryOptions): Promise<PaginationResult<any>> {
    const { page = 1, limit = 20, sort, filters, search, searchFields } = options;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params: any[] = [];
    let paramIndex = 1;

    // Build filters
    if (filters && Object.keys(filters).length > 0) {
      const result = this.buildWhereClause(filters, paramIndex);
      whereClause = result.clause;
      params = result.params;
      paramIndex = result.nextIndex;
    }

    // Build search
    if (search && searchFields && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => {
        params.push(`%${search}%`);
        return `"${field}"::text ILIKE $${paramIndex++}`;
      });
      const searchClause = `(${searchConditions.join(' OR ')})`;
      whereClause = whereClause
        ? `${whereClause} AND ${searchClause}`
        : `WHERE ${searchClause}`;
    }

    // Build ORDER BY
    const orderClause = sort
      ? `ORDER BY "${sort.field}" ${sort.direction}`
      : 'ORDER BY 1';

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM "${table}" ${whereClause}`;
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Fetch data
    const dataQuery = `SELECT * FROM "${table}" ${whereClause} ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataResult = await this.pool.query(dataQuery, [...params, limit, offset]);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
    };
  }

  async findById(table: string, id: any, primaryKey: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM "${table}" WHERE "${primaryKey}" = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async insert(table: string, data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`);

    const result = await this.pool.query(
      `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async update(
    table: string,
    id: any,
    data: Record<string, any>,
    primaryKey: string,
  ): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');

    const result = await this.pool.query(
      `UPDATE "${table}" SET ${setClause} WHERE "${primaryKey}" = $${keys.length + 1} RETURNING *`,
      [...values, id],
    );
    return result.rows[0];
  }

  async delete(table: string, id: any, primaryKey: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM "${table}" WHERE "${primaryKey}" = $1`,
      [id],
    );
  }

  async executeRaw(sql: string, params?: any[]): Promise<any> {
    this.validateSQL(sql);
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async beginTransaction(): Promise<void> {
    this.client = await this.pool.connect();
    await this.client.query('BEGIN');
  }

  async commit(): Promise<void> {
    if (this.client) {
      await this.client.query('COMMIT');
      this.client.release();
      this.client = null;
    }
  }

  async rollback(): Promise<void> {
    if (this.client) {
      await this.client.query('ROLLBACK');
      this.client.release();
      this.client = null;
    }
  }

  private normalizeType(pgType: string): string {
    const typeMap: Record<string, string> = {
      'character varying': 'string',
      varchar: 'string',
      text: 'string',
      integer: 'number',
      bigint: 'number',
      smallint: 'number',
      numeric: 'number',
      real: 'number',
      'double precision': 'number',
      boolean: 'boolean',
      date: 'date',
      'timestamp without time zone': 'datetime',
      'timestamp with time zone': 'datetime',
      json: 'json',
      jsonb: 'json',
      uuid: 'string',
    };
    return typeMap[pgType] || 'string';
  }
}
