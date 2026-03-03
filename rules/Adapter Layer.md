Rất tốt 🔥
Giờ mình sẽ thiết kế cho bạn **Database Adapter chuẩn production-grade**, đúng nghĩa có thể scale lâu dài.

Đây không còn là demo CRUD nữa — mà là **DB Engine Layer** cho hệ thống của bạn.

---

# 🎯 Mục tiêu của Adapter Layer

* Hỗ trợ nhiều DB
* Chuẩn hóa schema
* Chuẩn hóa pagination
* Chuẩn hóa error
* Chuẩn hóa transaction
* Không leak SQL syntax ra ngoài

---

# 🏗 Kiến trúc Adapter Layer

```text
Controller
   ↓
CrudService
   ↓
DatabaseService
   ↓
Adapter (interface)
   ↓
Concrete Adapter (Postgres | MySQL | Oracle)
```

---

# 🧠 1️⃣ Thiết kế Interface chuẩn

```ts
// src/core/database/types/database-adapter.interface.ts

export interface DatabaseAdapter {
  connect(config: DBConfig): Promise<void>;
  disconnect(): Promise<void>;

  getTables(): Promise<string[]>;

  getSchema(table: string): Promise<ColumnSchema[]>;

  findAll(
    table: string,
    options: QueryOptions
  ): Promise<PaginationResult<any>>;

  findById(
    table: string,
    id: any,
    primaryKey: string
  ): Promise<any>;

  insert(table: string, data: Record<string, any>): Promise<any>;

  update(
    table: string,
    id: any,
    data: Record<string, any>,
    primaryKey: string
  ): Promise<any>;

  delete(
    table: string,
    id: any,
    primaryKey: string
  ): Promise<void>;

  executeRaw(
    sql: string,
    params?: any[]
  ): Promise<any>;

  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

---

# 🧱 2️⃣ Common Types (Quan trọng để normalize)

```ts
export interface DBConfig {
  type: 'postgres' | 'mysql' | 'oracle';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
  defaultValue?: any;
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
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

---

# 🏭 3️⃣ Base Adapter (Abstract Class)

Để tránh lặp code:

```ts
export abstract class BaseAdapter implements DatabaseAdapter {
  protected client: any;

  abstract connect(config: DBConfig): Promise<void>;
  abstract getTables(): Promise<string[]>;
  abstract getSchema(table: string): Promise<ColumnSchema[]>;
  abstract executeRaw(sql: string, params?: any[]): Promise<any>;

  async beginTransaction() {
    await this.executeRaw('BEGIN');
  }

  async commit() {
    await this.executeRaw('COMMIT');
  }

  async rollback() {
    await this.executeRaw('ROLLBACK');
  }
}
```

---

# 🧠 4️⃣ Pagination Normalization Strategy

Bạn không để Controller biết DB syntax.

## Ví dụ trong Postgres:

```sql
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 10 OFFSET 20
```

## Trong Oracle:

```sql
SELECT * FROM (
   SELECT a.*, ROWNUM rnum FROM (
      SELECT * FROM users ORDER BY created_at DESC
   ) a WHERE ROWNUM <= 30
)
WHERE rnum > 20
```

👉 Nhưng tất cả đều phải trả về:

```ts
{
  data: [],
  total: 100,
  page: 2,
  limit: 10
}
```

---

# 🧠 5️⃣ Schema Extraction Strategy

Mỗi DB khác nhau:

### PostgreSQL

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';
```

### MySQL

```sql
DESCRIBE users;
```

### Oracle

```sql
SELECT column_name, data_type, nullable
FROM user_tab_columns
WHERE table_name = 'USERS';
```

👉 Adapter convert tất cả về ColumnSchema.

---

# 🔐 6️⃣ Security Layer trong Adapter

Trước khi executeRaw:

```ts
validateSQL(sql: string) {
  const forbidden = ['DROP', 'TRUNCATE'];
  if (forbidden.some(word => sql.toUpperCase().includes(word))) {
    throw new Error('Forbidden SQL operation');
  }
}
```

Và block:

* DELETE không WHERE
* UPDATE không WHERE

---

# 🧠 7️⃣ Error Normalization

Mỗi DB có error code khác nhau.

Ví dụ:

* Postgres duplicate key: 23505
* MySQL duplicate key: 1062
* Oracle duplicate key: ORA-00001

Bạn convert thành:

```ts
throw new DatabaseError({
  type: 'DUPLICATE_KEY',
  message: 'Duplicate primary key'
});
```

---

# 🧩 8️⃣ Connection Pool Strategy

Production phải:

* Không tạo connection mỗi request
* Dùng pool

Ví dụ:

```ts
pg.Pool
mysql2.createPool
oracledb.createPool
```

---

# 🧠 9️⃣ Adapter Factory (Production-safe)

```ts
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
        throw new Error('Unsupported DB type');
    }
  }
}
```

---

# 🚀 10️⃣ Enterprise-level Improvement

Sau này bạn có thể thêm:

* Query Cache Layer
* Read / Write split
* Replication awareness
* Connection health check

---

# 🧠 Đây là kiến trúc bạn vừa xây dựng:

> Clean, extensible, multi-database abstraction engine

Không còn là CRUD app nữa —
mà là một **Data Platform Core Engine**.

