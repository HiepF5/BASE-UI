> Database Abstraction Layer (DB Adapter Pattern)

---

# 1. Mục tiêu hệ thống

1. Phải hỗ trợ nhiều RDBMS:
   - PostgreSQL
   - MySQL
   - Oracle
   - Có khả năng mở rộng thêm SQL Server
2. Không được sửa frontend khi đổi DB.
3. CRUD phải dùng chung một API layer.
4. Schema phải đọc động (dynamic introspection).

---

# 2. Kiến Trúc Bắt Buộc

## Luồng hệ thống phải theo thứ tự:

```text
Frontend
   ↓
Generic CRUD API
   ↓
Database Abstraction Layer
   ↓
DB Adapter (Postgres | MySQL | Oracle)
   ↓
Database
```

- Không được bỏ qua abstraction layer.
- Controller không được gọi DB trực tiếp.

---

# 3. Backend Folder Structure

```text
src/
│
├── core/
│   ├── database/
│   │    ├── database.module.ts
│   │    ├── database.service.ts
│   │    │
│   │    ├── adapters/
│   │    │     ├── base.adapter.ts
│   │    │     ├── postgres.adapter.ts
│   │    │     ├── mysql.adapter.ts
│   │    │     ├── oracle.adapter.ts
│   │    │
│   │    ├── factories/
│   │    │     ├── adapter.factory.ts
│   │    │
│   │    ├── types/
│   │    │     ├── db.types.ts
│
├── modules/
│   ├── connections/
│   ├── schema/
│   ├── crud/
│   ├── audit/
```

---

# 4. Base Adapter (Interface chung)

```ts
export interface DatabaseAdapter {
  connect(config: DBConfig): Promise<void>;
  getTables(): Promise<string[]>;
  getSchema(table: string): Promise<ColumnSchema[]>;
  findAll(table: string, query: QueryOptions): Promise<any[]>;
  insert(table: string, data: any): Promise<any>;
  update(table: string, id: any, data: any): Promise<any>;
  delete(table: string, id: any): Promise<any>;
  executeRaw(sql: string, params?: any[]): Promise<any>;
}
```

1. Mọi adapter phải implement chung một interface:

```ts
DatabaseAdapter;
```

2. Adapter không được:
   - Trả về format khác nhau
   - Leak DB-specific format ra ngoài
3. Adapter phải normalize:
   - Pagination
   - Schema
   - Error
   - Data type
4. Mọi query phải parameter binding.
5. Không được nối string SQL trực tiếp.

### Postgres Adapter

```ts
export class PostgresAdapter implements DatabaseAdapter {
  async getTables() {
    return this.client.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
      `);
  }
}
```

### Oracle Adapter

Oracle khác ở:

- Pagination dùng ROWNUM
- Schema query khác
- Date format khác

# 5. Adapter Factory

```ts
export class AdapterFactory {
  static create(type: string): DatabaseAdapter {
    switch (type) {
      case 'postgres':
        return new PostgresAdapter();
      case 'mysql':
        return new MysqlAdapter();
      case 'oracle':
        return new OracleAdapter();
      default:
        throw new Error('Unsupported DB');
    }
  }
}
```

---

# 6. Database Service

```ts
@Injectable()
export class DatabaseService {
  private adapter: DatabaseAdapter;

  setConnection(config: DBConfig) {
    this.adapter = AdapterFactory.create(config.type);
    return this.adapter.connect(config);
  }

  getTables() {
    return this.adapter.getTables();
  }
}
```

---

# 7. Multi-Connection Rule

- Phải lưu thông tin connection trong DB (`db_connections`).
- Password phải được mã hóa.
- Không được hard-code DB config.
- Phải hỗ trợ nhiều connection cùng lúc.
- Adapter được tạo động theo connection type.

# 8. Bảo mật cực kỳ quan trọng

1. Không cho phép raw SQL tự do từ frontend.
2. Nếu có raw SQL:
   - Validate lệnh
   - Chặn DROP
   - Chặn TRUNCATE
   - Chặn DELETE không WHERE
3. Password DB phải:
   - Encrypt bằng AES
   - Key nằm trong ENV
4. Phải có:
   - Timeout connection
   - Query execution timeout
   - Rate limit

# 9. Pagination chuẩn multi-DB

| DB         | Pagination          |
| ---------- | ------------------- |
| PostgreSQL | LIMIT OFFSET        |
| MySQL      | LIMIT OFFSET        |
| Oracle     | ROWNUM / FETCH NEXT |

Adapter phải normalize về:

```ts
{
  data: [],
  total: number
}
```

# 10. Schema Normalization

Mỗi DB trả schema khác nhau.
Bạn phải convert về format chung:

```ts
interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
}
```

# 11. Layer Separation Rule

Luồng backend bắt buộc:

```
Controller
   ↓
CrudService
   ↓
DatabaseService
   ↓
Adapter
   ↓
Database
```

- Controller không gọi Adapter trực tiếp
- Controller không viết SQL

# 12 . CRUD Engine Rule

- CRUD phải dynamic theo table name.
- Phải validate table name.
- Phải validate column name.
- Không được trust input từ client.
- Bulk operations phải có limit.

## 13. Query Builder Layer ( LV2)

1. Không viết raw SQL trong service.
2. Phải có:
   - Query abstraction layer
   - Operator mapping
   - Safe parameter binding
3. Phải giới hạn:
   - Max limit
   - Max filter depth

# 14. Error Normalization Rule

Mỗi DB có error khác nhau.
Adapter phải map về code chung:

| DB Error         | Normalized Code     |
| ---------------- | ------------------- |
| Unique violation | DUPLICATE_RESOURCE  |
| FK violation     | FOREIGN_KEY_ERROR   |
| Connection error | DB_CONNECTION_ERROR |

Frontend không được thấy lỗi raw của DB.

# 15. Extensibility Rule

Khi thêm DB mới:

1. Không sửa frontend.
2. Không sửa service.
3. Chỉ cần: - Tạo adapter mới - Đăng ký trong factory
   Nếu phải sửa nhiều nơi → kiến trúc sai.

# 16. Production Rule

1. Phải có logging query time.
2. Phải có audit mutation.
3. Phải có health check.
4. Phải có monitoring.
5. Phải có connection pool management

# 17. Scale tương lai

Sau này scale có thể thêm:

- MongoDB Adapter
- Redis Inspector
- Kafka Monitor (theo thế mạnh bạn)

# 18. Nguyên Tắc Cốt Lõi

1. Abstraction trước, DB sau.
2. Normalize mọi thứ.
3. Không leak DB-specific logic ra ngoài.
4. Secure by default.
5. Thêm DB mới không làm vỡ hệ thống.
