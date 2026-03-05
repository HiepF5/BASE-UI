# API Design Rules

## 1. Base URL & Versioning

- Prefix chuẩn: `/api`
- Bắt buộc versioning:

```
/api/v1/{resource}
```

- Không deploy API không version

## 2. RESTful Resource Convention

### CRUD Pattern

```
GET    /api/{resource}          → List (paginated)
GET    /api/{resource}/:id      → Detail
POST   /api/{resource}          → Create
PUT    /api/{resource}/:id      → Full update
PATCH  /api/{resource}/:id      → Partial update
DELETE /api/{resource}/:id      → Delete
POST   /api/{resource}/bulk-delete → Bulk delete
```

### Bulk Operations

```
POST /api/v1/{resource}/bulk-create
POST /api/v1/{resource}/bulk-update
POST /api/v1/{resource}/bulk-delete
```

Body chuẩn:

```json
{
  "ids": [1, 2, 3]
}
```

## 3. Authentication Endpoints

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
GET    /api/v1/auth/profile
POST   /api/v1/auth/logout
```

### Auth Flow Rules

- Access token: short-lived (≈15m)
- Refresh token: long-lived (7–30d)
- Refresh token lưu HttpOnly cookie
- JWT chứa roles + permissions
- Hỗ trợ revoke refresh token

## 4. Query Parameters (cho List endpoints)

| Param     | Type   | Description              | Example                                      |
| --------- | ------ | ------------------------ | -------------------------------------------- |
| `page`    | number | Trang hiện tại (1-based) | `?page=2`                                    |
| `limit`   | number | Số bản ghi/trang         | `?limit=25`                                  |
| `sort`    | string | field:direction          | `?sort=name:asc,createdAt:desc`              |
| `search`  | string | Full-text search         | `?search=keyword`                            |
| `filter`  | JSON   | FilterGroup AST          | `?filter={"logic":"AND","conditions":[...]}` |
| `include` | string | Relations to load        | `?include=author,comments`                   |
| `select`  | string | Projection               | `?select=id,name,email`                      |

## 5. Pagination Response Format

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

## 6. Filter AST Format

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

| Operator    | SQL Equivalent       | Notes             |
| ----------- | -------------------- | ----------------- |
| `eq`        | `= value`            |                   |
| `neq`       | `!= value`           |                   |
| `gt`        | `> value`            |                   |
| `gte`       | `>= value`           |                   |
| `lt`        | `< value`            |                   |
| `lte`       | `<= value`           |                   |
| `like`      | `LIKE '%value%'`     |                   |
| `notLike`   | `NOT LIKE '%value%'` |                   |
| `in`        | `IN (values)`        | value là array    |
| `notIn`     | `NOT IN (values)`    | value là array    |
| `isNull`    | `IS NULL`            | không cần value   |
| `isNotNull` | `IS NOT NULL`        | không cần value   |
| `between`   | `BETWEEN a AND b`    | value: [min, max] |

### Security Rules

- Whitelist allowed fields
- Validate operator
- Limit nested depth
- Không build raw SQL trực tiếp

# 7. Include & Select Rules

- Không include quá 2 cấp
- Whitelist field được select
- Không expose field nhạy cảm
- Tối ưu N+1 query

## 8. HTTP Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | OK               |
| 201  | Created          |
| 204  | No Content       |
| 400  | Bad Request      |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not Found        |
| 409  | Conflict         |
| 422  | Validation error |
| 429  | Rate limit       |
| 500  | Internal error   |

## 9. Standard Response Wrapper

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [],
  "timestamp": "2026-03-04T10:00:00Z",
  "path": "/api/v1/users",
  "requestId": "req-123"
}
```

## 10. Security & Authorization

- JWT Bearer authentication
- RBAC (role-based access control)
- Permission-based access (`user.create`)
- Rate limiting
- Input validation (DTO validation)
- Global exception filter
- RequestId middleware
- Logging interceptor

## 11. Data Rules

- Soft delete mặc định (`isDeleted`, `deletedAt`)
- Audit logging cho mọi mutation
- Không return entity trực tiếp → luôn map DTO
- Không chứa business logic trong controller
- Không viết raw SQL trong controller

## 12. Architecture Layering Rule

```
Controller
  ↓
Service
  ↓
Repository
  ↓
Query Engine (Filter AST Parser)
```

- Không parse filter trong controller
- Không truy cập DB trực tiếp từ controller

## 13. Performance & Protection

- Giới hạn `limit` (ví dụ max 100)
- Limit filter depth
- Rate limit per IP / user
- Index các field thường filter
- Cache nếu cần

## 14. Authentication Flow

```
1. Client POST /auth/login → { username, password }
2. Server validates → returns { access_token, refresh_token }
3. Client stores tokens in localStorage
4. Subsequent requests: Authorization: Bearer {access_token}
5. On 401: Client POST /auth/refresh → { refresh_token }
6. Server returns new { access_token }
7. Client retries original request
```
