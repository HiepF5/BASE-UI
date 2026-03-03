# Database Adapter Development Guide

## 1. Multi-DB Adapter Pattern

### Tổng quan
Hệ thống hỗ trợ **PostgreSQL, MySQL, Oracle** thông qua Adapter Pattern:

```
Controller → Service → DatabaseAdapter (interface) → Concrete Adapter
                                                     ├── PostgresAdapter
                                                     ├── MysqlAdapter
                                                     └── OracleAdapter
```

### DatabaseAdapter Interface
```typescript
interface DatabaseAdapter {
  /** Execute raw query with params */
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  
  /** Get all tables in schema */
  getTables(): Promise<string[]>;
  
  /** Get column definitions */
  getColumns(table: string): Promise<ColumnSchema[]>;
  
  /** Get foreign key relations */
  getRelations(table: string): Promise<RelationSchema[]>;
  
  /** Paginated select with filter/sort */
  findMany(table: string, options: QueryOptions): Promise<PaginatedResult>;
  
  /** Find one by primary key */
  findOne(table: string, id: any, primaryKey?: string): Promise<any>;
  
  /** Insert row */
  insert(table: string, data: Record<string, any>): Promise<any>;
  
  /** Update row */
  update(table: string, id: any, data: Record<string, any>, primaryKey?: string): Promise<any>;
  
  /** Delete row */
  delete(table: string, id: any, primaryKey?: string): Promise<boolean>;
  
  /** Test connection */
  testConnection(): Promise<boolean>;
  
  /** Disconnect */
  disconnect(): Promise<void>;
}
```

## 2. Thêm Database mới (VD: SQLite)

### Step 1: Tạo adapter
```
server/src/core/database/adapters/sqlite.adapter.ts
```

### Step 2: Implement interface
```typescript
import { DatabaseAdapter } from '../database.interface';

export class SqliteAdapter implements DatabaseAdapter {
  private db: BetterSqlite3.Database;

  constructor(config: ConnectionConfig) {
    this.db = new Database(config.database);
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return this.db.prepare(sql).all(...(params ?? [])) as T[];
  }

  async getTables(): Promise<string[]> {
    const rows = await this.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    return rows.map(r => r.name);
  }

  // ... implement remaining methods
}
```

### Step 3: Register trong factory
```typescript
// database.factory.ts
case 'sqlite':
  return new SqliteAdapter(config);
```

### Step 4: Update ConnectionInfo type
```typescript
type: 'postgres' | 'mysql' | 'oracle' | 'sqlite';
```

## 3. Schema Introspection Queries

### PostgreSQL
```sql
-- Tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Columns
SELECT column_name, data_type, is_nullable, column_default, 
       character_maximum_length
FROM information_schema.columns
WHERE table_name = $1 AND table_schema = 'public';

-- Primary keys
SELECT kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';

-- Foreign keys
SELECT
  kcu.column_name AS source_column,
  ccu.table_name AS target_table,
  ccu.column_name AS target_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY';
```

### MySQL
```sql
-- Tables
SELECT TABLE_NAME FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE';

-- Columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, 
       CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_NAME = ? AND TABLE_SCHEMA = DATABASE();
```

### Oracle
```sql
-- Tables
SELECT TABLE_NAME FROM USER_TABLES;

-- Columns
SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT, DATA_LENGTH
FROM USER_TAB_COLUMNS WHERE TABLE_NAME = :table;
```

## 4. Query Building Rules

### Filter → SQL
```typescript
// FilterCondition → parameterized SQL
function conditionToSql(c: FilterCondition, paramIndex: number): {sql: string, params: any[]} {
  switch (c.operator) {
    case 'eq':      return { sql: `"${c.field}" = $${paramIndex}`, params: [c.value] };
    case 'like':    return { sql: `"${c.field}" ILIKE $${paramIndex}`, params: [`%${c.value}%`] };
    case 'in':      return { sql: `"${c.field}" = ANY($${paramIndex})`, params: [c.value] };
    case 'isNull':  return { sql: `"${c.field}" IS NULL`, params: [] };
    case 'between': return { sql: `"${c.field}" BETWEEN $${paramIndex} AND $${paramIndex+1}`, params: c.value };
    // ...
  }
}
```

### LUÔN dùng parameterized queries
```typescript
// ✅ GOOD
await adapter.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ BAD - SQL injection vulnerable
await adapter.query(`SELECT * FROM users WHERE id = '${userId}'`);
```

## 5. Connection Pooling
- PostgreSQL: `pg` pool (`max: 20, idleTimeoutMillis: 30000`)
- MySQL: `mysql2` pool (`connectionLimit: 20, waitForConnections: true`)
- Oracle: `oracledb` pool (`poolMin: 2, poolMax: 20`)
