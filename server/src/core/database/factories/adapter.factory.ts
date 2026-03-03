import { DatabaseAdapter } from '../adapters/database-adapter.interface';
import { PostgresAdapter } from '../adapters/postgres.adapter';
import { MysqlAdapter } from '../adapters/mysql.adapter';
import { OracleAdapter } from '../adapters/oracle.adapter';
import { DBConfig } from '../types/db.types';

// ============================================================
// AdapterFactory - Tạo adapter theo DB type
// ============================================================
export class AdapterFactory {
  static create(config: DBConfig): DatabaseAdapter {
    switch (config.type) {
      case 'postgres':
        return new PostgresAdapter();
      case 'mysql':
        return new MysqlAdapter();
      case 'oracle':
        return new OracleAdapter();
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}
