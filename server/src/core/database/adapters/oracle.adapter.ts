import { BaseAdapter } from './base.adapter';
import {
  DBConfig,
  ColumnSchema,
  QueryOptions,
  PaginationResult,
} from '../types/db.types';

// ============================================================
// OracleAdapter - Concrete adapter cho Oracle DB
// ============================================================
export class OracleAdapter extends BaseAdapter {
  private pool: any; // oracledb pool

  async connect(config: DBConfig): Promise<void> {
    const oracledb = await import('oracledb');
    this.pool = await oracledb.default.createPool({
      user: config.username,
      password: config.password,
      connectString: `${config.host}:${config.port}/${config.database}`,
      poolMin: 2,
      poolMax: config.poolSize || 10,
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close(0);
      this.connected = false;
    }
  }

  async getTables(): Promise<string[]> {
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT table_name FROM user_tables ORDER BY table_name`,
      );
      return result.rows.map((row: any) => row[0]);
    } finally {
      await conn.close();
    }
  }

  async getSchema(table: string): Promise<ColumnSchema[]> {
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT
           utc.column_name,
           utc.data_type,
           utc.nullable,
           utc.data_default,
           utc.data_length,
           CASE WHEN uc.column_name IS NOT NULL THEN 'Y' ELSE 'N' END AS is_pk
         FROM user_tab_columns utc
         LEFT JOIN (
           SELECT cols.column_name
           FROM user_constraints con
           JOIN user_cons_columns cols ON con.constraint_name = cols.constraint_name
           WHERE con.constraint_type = 'P' AND con.table_name = :table
         ) uc ON utc.column_name = uc.column_name
         WHERE utc.table_name = :table
         ORDER BY utc.column_id`,
        { table: table.toUpperCase() },
      );
      return result.rows.map((row: any) => ({
        name: row[0],
        type: this.normalizeType(row[1]),
        nullable: row[2] === 'Y',
        defaultValue: row[3],
        maxLength: row[4],
        primary: row[5] === 'Y',
      }));
    } finally {
      await conn.close();
    }
  }

  async getPrimaryKey(table: string): Promise<string> {
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT cols.column_name
         FROM user_constraints con
         JOIN user_cons_columns cols ON con.constraint_name = cols.constraint_name
         WHERE con.constraint_type = 'P' AND con.table_name = :table`,
        { table: table.toUpperCase() },
      );
      return result.rows[0]?.[0] || 'ID';
    } finally {
      await conn.close();
    }
  }

  async getForeignKeys(
    table: string,
  ): Promise<Array<{ column: string; foreignTable: string; foreignColumn: string }>> {
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT
           a.column_name,
           c_pk.table_name AS foreign_table,
           b.column_name AS foreign_column
         FROM user_cons_columns a
         JOIN user_constraints c ON a.constraint_name = c.constraint_name
         JOIN user_constraints c_pk ON c.r_constraint_name = c_pk.constraint_name
         JOIN user_cons_columns b ON c_pk.constraint_name = b.constraint_name
         WHERE c.constraint_type = 'R' AND c.table_name = :table`,
        { table: table.toUpperCase() },
      );
      return result.rows.map((row: any) => ({
        column: row[0],
        foreignTable: row[1],
        foreignColumn: row[2],
      }));
    } finally {
      await conn.close();
    }
  }

  async findAll(table: string, options: QueryOptions): Promise<PaginationResult<any>> {
    const { page = 1, limit = 20, sort, filters } = options;
    const offset = (page - 1) * limit;
    const conn = await this.pool.getConnection();

    try {
      let whereClause = '';
      const params: Record<string, any> = {};

      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.entries(filters).map(([field, value], i) => {
          params[`p${i}`] = value;
          return `"${field}" = :p${i}`;
        });
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }

      const orderClause = sort ? `ORDER BY "${sort.field}" ${sort.direction}` : '';

      // Count
      const countResult = await conn.execute(
        `SELECT COUNT(*) AS total FROM "${table}" ${whereClause}`,
        params,
      );
      const total = countResult.rows[0][0];

      // Data with Oracle pagination (OFFSET FETCH for 12c+)
      const dataResult = await conn.execute(
        `SELECT * FROM "${table}" ${whereClause} ${orderClause}
         OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        { ...params, offset, limit },
      );

      // Convert Oracle rows to objects
      const columns = dataResult.metaData.map((m: any) => m.name);
      const data = dataResult.rows.map((row: any) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => {
          obj[col] = row[i];
        });
        return obj;
      });

      return { data, total, page, limit };
    } finally {
      await conn.close();
    }
  }

  async findById(table: string, id: any, primaryKey: string): Promise<any> {
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM "${table}" WHERE "${primaryKey}" = :id`,
        { id },
      );
      if (!result.rows.length) return null;
      const columns = result.metaData.map((m: any) => m.name);
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = result.rows[0][i];
      });
      return obj;
    } finally {
      await conn.close();
    }
  }

  async insert(table: string, data: Record<string, any>): Promise<any> {
    const conn = await this.pool.getConnection();
    try {
      const keys = Object.keys(data);
      const placeholders = keys.map((k) => `:${k}`);
      await conn.execute(
        `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
        data,
        { autoCommit: true },
      );
      return data;
    } finally {
      await conn.close();
    }
  }

  async update(table: string, id: any, data: Record<string, any>, primaryKey: string): Promise<any> {
    const conn = await this.pool.getConnection();
    try {
      const setClause = Object.keys(data)
        .map((k) => `"${k}" = :${k}`)
        .join(', ');
      await conn.execute(
        `UPDATE "${table}" SET ${setClause} WHERE "${primaryKey}" = :_id`,
        { ...data, _id: id },
        { autoCommit: true },
      );
      return { [primaryKey]: id, ...data };
    } finally {
      await conn.close();
    }
  }

  async delete(table: string, id: any, primaryKey: string): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.execute(
        `DELETE FROM "${table}" WHERE "${primaryKey}" = :id`,
        { id },
        { autoCommit: true },
      );
    } finally {
      await conn.close();
    }
  }

  async executeRaw(sql: string, params?: any[]): Promise<any> {
    this.validateSQL(sql);
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(sql, params || [], { autoCommit: true });
      return result.rows;
    } finally {
      await conn.close();
    }
  }

  private normalizeType(oracleType: string): string {
    const upper = oracleType.toUpperCase();
    if (upper.includes('NUMBER') || upper.includes('FLOAT')) return 'number';
    if (upper.includes('VARCHAR') || upper.includes('CHAR') || upper.includes('CLOB')) return 'string';
    if (upper.includes('DATE') || upper.includes('TIMESTAMP')) return 'datetime';
    if (upper.includes('BLOB') || upper.includes('RAW')) return 'binary';
    return 'string';
  }
}
