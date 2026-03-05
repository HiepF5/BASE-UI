# Security Rules

## 1. Authentication

### JWT Token

- Access token: **15 phút** expiry
- Refresh token: **7 ngày** expiry
- Algorithm: **HS256** (hoặc RS256 cho production)
- Token payload: `{ sub: userId, username, role, iat, exp }`

### Password

- Hash bằng **bcrypt** (salt rounds: 10)
- KHÔNG lưu plaintext password
- Password policy: min 8 ký tự (configurable)

### Auth Flow

```
Client → POST /auth/login → Server validate → JWT tokens
Client → Authorization: Bearer {token} → JwtAuthGuard validate
401 → Client refresh → POST /auth/refresh → New tokens
```

## 2. Authorization (RBAC)

### Roles

| Role     | Permissions                                            |
| -------- | ------------------------------------------------------ |
| `admin`  | Full access (all CRUD + settings + user management)    |
| `editor` | Read + Create + Update (no delete, no user management) |
| `viewer` | Read only                                              |

### Guard Chain

```
Request → JwtAuthGuard → RolesGuard → Controller
```

### Decorator Usage

```typescript
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
remove(@Param('id') id: string) { ... }
```

## 3. SQL Injection Prevention

### Rules

- KHÔNG dùng string concatenation cho SQL
- Dùng **parameterized queries** (placeholder: `$1`, `?`, `:param`)
- `SqlValidator` utility validate column names, table names
- Whitelist table names trong CRUD endpoint
- Filter AST parser escape tất cả values

### Column Name Validation

```typescript
// Chỉ cho phép: a-z, A-Z, 0-9, _
function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}
```

## 4. Path Traversal Prevention (AI FileTool)

```typescript
// Resolve và validate path nằm trong project root
function safePath(userPath: string, rootDir: string): string {
  const resolved = path.resolve(rootDir, userPath);
  if (!resolved.startsWith(rootDir)) {
    throw new ForbiddenException('Path traversal detected');
  }
  return resolved;
}
```

## 5. Rate Limiting

- Login: 5 attempts / minute / IP
- API: 100 requests / minute / user
- AI: 20 requests / minute / user

## 6. CORS

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
```

## 7. Input Validation

- Dùng `class-validator` + `class-transformer` cho DTOs
- Global `ValidationPipe` with `whitelist: true, transform: true`
- Reject unknown properties (`forbidNonWhitelisted: true`)

## 8. Error Handling

- `HttpExceptionFilter` catch tất cả exceptions
- KHÔNG expose internal error details cho client ở production
- Log full error stack ở server
- Return standardized error format

## 9. Checklist Security khi deploy

- [ ] Set `NODE_ENV=production`
- [ ] JWT secret từ environment variable, KHÔNG hardcode
- [ ] Enable HTTPS
- [ ] Enable rate limiting
- [ ] Enable CORS with specific origins
- [ ] Disable Swagger in production
- [ ] Enable helmet headers
- [ ] Audit log cho critical operations
