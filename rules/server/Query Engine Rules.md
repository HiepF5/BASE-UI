# Query Engine Rules

## 1. Tổng quan

Query Engine nằm ở `server/src/core/query-engine/` — chịu trách nhiệm parse filter/sort/search từ HTTP query params → SQL conditions.

## 2. Components

```
query-engine/
├── filter-parser.ts       # Parse FilterGroup AST → SQL WHERE
├── relation-parser.ts     # Parse include → JOIN clauses
├── orm-adapter.ts         # Abstraction cho SQL dialect differences
└── index.ts
```

## 3. FilterParser

### Input: FilterGroup AST

```json
{
  "logic": "AND",
  "conditions": [
    { "field": "status", "operator": "eq", "value": "active" },
    { "field": "age", "operator": "gte", "value": 18 }
  ]
}
```

### Output: SQL WHERE clause + params

```sql
WHERE ("status" = $1 AND "age" >= $2)
-- params: ['active', 18]
```

### Recursive Parsing

```typescript
function parseGroup(group: FilterGroup, startIndex: number): ParseResult {
  const parts: string[] = [];
  const params: any[] = [];
  let paramIdx = startIndex;

  for (const node of group.conditions) {
    if (isFilterGroup(node)) {
      const sub = parseGroup(node, paramIdx);
      parts.push(`(${sub.sql})`);
      params.push(...sub.params);
      paramIdx += sub.params.length;
    } else {
      const { sql, params: p } = parseCondition(node, paramIdx);
      parts.push(sql);
      params.push(...p);
      paramIdx += p.length;
    }
  }

  return {
    sql: parts.join(` ${group.logic} `),
    params,
  };
}
```

## 4. Sort Parsing

### Input: `sort=name:asc,createdAt:desc`

### Output:

```sql
ORDER BY "name" ASC, "created_at" DESC
```

### Validation

- Column name MUST match `^[a-zA-Z_][a-zA-Z0-9_]*$`
- Direction MUST be 'asc' or 'desc'
- Reject tất cả invalid input

## 5. Search Parsing

### Strategy: ILIKE across text columns

```sql
WHERE ("name" ILIKE $1 OR "email" ILIKE $1 OR "description" ILIKE $1)
-- params: ['%keyword%']
```

- Auto detect text columns từ schema
- ILIKE cho PostgreSQL, LIKE LOWER() cho MySQL
- Full-text search nếu DB support (tsvector cho PostgreSQL)

## 6. Relation Parsing

### Input: `include=author,comments.user`

### Strategy:

1. Parse include paths
2. Look up relation metadata từ schema
3. Build JOIN hoặc separate query (strategy configurable)

### Separate Query Strategy (Default)

```sql
-- Main query
SELECT * FROM posts WHERE ...

-- Relation: author (MANY_TO_ONE)
SELECT * FROM users WHERE id IN ($1, $2, ...)

-- Nested: comments + comments.user
SELECT * FROM comments WHERE post_id IN ($1, $2, ...)
SELECT * FROM users WHERE id IN ($1, $2, ...)
```

### JOIN Strategy

```sql
SELECT p.*, u.username AS "author.username"
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
WHERE ...
```

## 7. Pagination

### Offset-based (default)

```sql
SELECT * FROM table WHERE ... ORDER BY ... LIMIT $1 OFFSET $2
-- LIMIT = limit, OFFSET = (page - 1) * limit
```

### Count query

```sql
SELECT COUNT(*) FROM table WHERE ...
```

### Response format

```json
{
  "data": [...],
  "total": 150,
  "page": 2,
  "limit": 25
}
```

## 8. SQL Dialect Differences

| Feature               | PostgreSQL         | MySQL               | Oracle                                 |
| --------------------- | ------------------ | ------------------- | -------------------------------------- |
| Case-insensitive LIKE | `ILIKE`            | `LIKE` (default CI) | `UPPER() LIKE UPPER()`                 |
| Parameter placeholder | `$1, $2`           | `?, ?`              | `:1, :2`                               |
| LIMIT/OFFSET          | `LIMIT n OFFSET m` | `LIMIT m, n`        | `OFFSET m ROWS FETCH NEXT n ROWS ONLY` |
| Boolean               | `true/false`       | `1/0`               | `1/0`                                  |
| JSON access           | `->`, `->>`        | `->`, `->>`         | `JSON_VALUE()`                         |
| String concat         | `\|\|`             | `CONCAT()`          | `\|\|`                                 |

## 9. Performance Rules

- KHÔNG SELECT \* trên production — dùng projection khi có select param
- Thêm INDEX cho columns thường xuyên filter/sort
- Giới hạn max `limit = 100` (configurable)
- Cache schema metadata (5 phút)
- Log slow queries (> 1s)
