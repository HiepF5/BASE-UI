# Error Handling Patterns

## 1. Tổng quan

Backend sử dụng **NestJS Exception Filter** pattern để xử lý tất cả errors một cách nhất quán.

## 2. Exception Hierarchy

```
Error
└── HttpException (NestJS built-in)
    ├── BadRequestException      (400)
    ├── UnauthorizedException    (401)
    ├── ForbiddenException       (403)
    ├── NotFoundException        (404)
    ├── ConflictException        (409)
    └── InternalServerErrorException (500)
```

## 3. Global Exception Filter

```typescript
// core/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = 500;
    let message = 'Internal Server Error';
    let errors: any[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
      errors = (res as any).errors;
    }

    // Log (only in non-production for full stack)
    if (status >= 500) {
      Logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 4. Validation Errors

```typescript
// Global ValidationPipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  exceptionFactory: (errors) => new BadRequestException({
    message: 'Validation failed',
    errors: errors.map(e => ({
      field: e.property,
      message: Object.values(e.constraints ?? {}).join(', '),
    })),
  }),
}));
```

## 5. Service-level Error Handling

### Pattern: Throw specific HttpException
```typescript
// ✅ GOOD — rõ ràng, đúng status code
async findOne(table: string, id: string) {
  const row = await this.adapter.findOne(table, id);
  if (!row) {
    throw new NotFoundException(`Record ${id} not found in ${table}`);
  }
  return row;
}

// ✅ GOOD — conflict khi duplicate
async create(table: string, data: any) {
  try {
    return await this.adapter.insert(table, data);
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique violation
      throw new ConflictException('Record already exists');
    }
    throw err; // re-throw unknown errors
  }
}
```

### Anti-patterns
```typescript
// ❌ BAD — catch-all return null
async findOne(table: string, id: string) {
  try {
    return await this.adapter.findOne(table, id);
  } catch { return null; }  // Swallows real errors!
}

// ❌ BAD — expose internal error
async create(table: string, data: any) {
  try {
    return await this.adapter.insert(table, data);
  } catch (err) {
    throw new InternalServerErrorException(err.message); // Leaks DB info!
  }
}
```

## 6. Database-specific Error Codes

| DB | Error | Meaning | HTTP Code |
|----|-------|---------|-----------|
| PostgreSQL | `23505` | Unique violation | 409 Conflict |
| PostgreSQL | `23503` | Foreign key violation | 400 Bad Request |
| PostgreSQL | `23502` | Not null violation | 400 Bad Request |
| PostgreSQL | `42P01` | Table not found | 404 Not Found |
| MySQL | `1062` | Duplicate entry | 409 Conflict |
| MySQL | `1452` | FK constraint fail | 400 Bad Request |
| MySQL | `1146` | Table doesn't exist | 404 Not Found |

## 7. Client-side Error Handling

### ApiClient interceptor
```typescript
// Normalize error for frontend consumption
private normalizeError(err: any) {
  if (err.response?.data) {
    return {
      status: err.response.status,
      message: err.response.data.message || err.message,
      errors: err.response.data.errors,
    };
  }
  return { status: 0, message: err.message || 'Network error' };
}
```

### Toast display
```typescript
// useCrud hook
onError: (err: any) => toast.error(err.message ?? 'Lỗi không xác định'),
```

## 8. Logging

- **Debug**: request details, query params
- **Info**: successful operations (create, update, delete)
- **Warn**: 4xx errors, slow queries (>1s)
- **Error**: 5xx errors, unhandled exceptions

### Audit Log
```typescript
// AuditInterceptor — log mọi mutation operation
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(() => {
        const req = context.switchToHttp().getRequest();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          this.auditService.log({
            action: req.method,
            entity: req.params.tableName,
            entityId: req.params.id,
            userId: req.user?.id,
            changes: req.body,
          });
        }
      }),
    );
  }
}
```
