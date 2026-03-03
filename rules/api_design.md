# API Design Rules

## 1. RESTful Conventions

### URL Pattern
```
GET    /api/{resource}          → List (paginated)
GET    /api/{resource}/:id      → Detail
POST   /api/{resource}          → Create
PUT    /api/{resource}/:id      → Full update
PATCH  /api/{resource}/:id      → Partial update
DELETE /api/{resource}/:id      → Delete
POST   /api/{resource}/bulk-delete → Bulk delete
```

### Generic CRUD URLs
```
GET    /api/crud/:tableName              → List records
GET    /api/crud/:tableName/:id          → Get one record
POST   /api/crud/:tableName              → Create record
PUT    /api/crud/:tableName/:id          → Update record
DELETE /api/crud/:tableName/:id          → Delete record
POST   /api/crud/:tableName/bulk-delete  → Bulk delete
```

### Schema URLs
```
GET    /api/schema/tables                → List all tables
GET    /api/schema/:table/columns        → Get table columns + relations
GET    /api/schema/:table/relations      → Get relations only
```

### Auth URLs
```
POST   /api/auth/login     → Login (JSON body: { username, password })
POST   /api/auth/register  → Register
POST   /api/auth/refresh   → Refresh token
GET    /api/auth/profile   → Get current user profile
```

### AI URLs
```
POST   /api/ai/execute     → Execute AI prompt
POST   /api/ai/apply       → Apply proposed file changes
GET    /api/ai/context      → Get project context
GET    /api/ai/skills       → List available skills
```

## 2. Query Parameters (cho List endpoints)

| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `page` | number | Trang hiện tại (1-based) | `?page=2` |
| `limit` | number | Số bản ghi/trang | `?limit=25` |
| `sort` | string | field:direction | `?sort=name:asc,createdAt:desc` |
| `search` | string | Full-text search | `?search=keyword` |
| `filter` | JSON | FilterGroup AST | `?filter={"logic":"AND","conditions":[...]}` |
| `include` | string | Relations to load | `?include=author,comments` |
| `select` | string | Projection | `?select=id,name,email` |

## 3. Filter AST Format

```json
{
  "logic": "AND",
  "conditions": [
    { "field": "status", "operator": "eq", "value": "active" },
    {
      "logic": "OR",
      "conditions": [
        { "field": "age", "operator": "gte", "value": 18 },
        { "field": "role", "operator": "in", "value": ["admin", "editor"] }
      ]
    }
  ]
}
```

### Supported Operators
| Operator | SQL Equivalent | Notes |
|----------|---------------|-------|
| `eq` | `= value` | |
| `neq` | `!= value` | |
| `gt` | `> value` | |
| `gte` | `>= value` | |
| `lt` | `< value` | |
| `lte` | `<= value` | |
| `like` | `LIKE '%value%'` | |
| `notLike` | `NOT LIKE '%value%'` | |
| `in` | `IN (values)` | value là array |
| `notIn` | `NOT IN (values)` | value là array |
| `isNull` | `IS NULL` | không cần value |
| `isNotNull` | `IS NOT NULL` | không cần value |
| `between` | `BETWEEN a AND b` | value: [min, max] |

## 4. HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST (create) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient role |
| 404 | Not Found | Entity not found |
| 409 | Conflict | Duplicate unique constraint |
| 500 | Internal Server Error | Unhandled error |

## 5. Authentication Flow

```
1. Client POST /auth/login → { username, password }
2. Server validates → returns { access_token, refresh_token }
3. Client stores tokens in localStorage
4. Subsequent requests: Authorization: Bearer {access_token}
5. On 401: Client POST /auth/refresh → { refresh_token }
6. Server returns new { access_token }
7. Client retries original request
```

## 6. Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    { "field": "username", "message": "Must be at least 3 characters" },
    { "field": "email", "message": "Invalid email format" }
  ]
}
```
