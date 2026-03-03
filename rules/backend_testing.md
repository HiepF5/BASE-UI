# Backend Testing Rules

## 1. Testing Strategy

### Test Pyramid
```
        ╱╲
       ╱ E2E ╲          (ít nhất, chậm nhất)
      ╱────────╲
     ╱Integration╲      (vừa, API tests)
    ╱──────────────╲
   ╱   Unit Tests   ╲   (nhiều nhất, nhanh nhất)
  ╱──────────────────╲
```

| Layer | Scope | Tools |
|-------|-------|-------|
| Unit | Service methods, utils, guards | Jest, mock dependencies |
| Integration | Controller → Service → DB | Jest, supertest, test DB |
| E2E | Full flow (auth → CRUD → AI) | Jest, supertest |

## 2. File Naming Convention

```
module-name/
├── module-name.service.ts
├── module-name.service.spec.ts      ← Unit test
├── module-name.controller.spec.ts   ← Integration test
└── __tests__/
    └── module-name.e2e-spec.ts      ← E2E test
```

## 3. Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CrudService } from './crud.service';
import { DatabaseService } from '../../core/database/database.service';

describe('CrudService', () => {
  let service: CrudService;
  let dbService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrudService,
        {
          provide: DatabaseService,
          useValue: {
            getAdapter: jest.fn().mockReturnValue({
              findMany: jest.fn(),
              findOne: jest.fn(),
              insert: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get(CrudService);
    dbService = module.get(DatabaseService);
  });

  describe('findMany', () => {
    it('should return paginated results', async () => {
      const mockResult = { data: [{ id: 1 }], total: 1, page: 1, limit: 25 };
      dbService.getAdapter().findMany.mockResolvedValue(mockResult);

      const result = await service.findMany('users', { page: 1, limit: 25 });
      
      expect(result).toEqual(mockResult);
      expect(dbService.getAdapter().findMany).toHaveBeenCalledWith('users', { page: 1, limit: 25 });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when record not found', async () => {
      dbService.getAdapter().findOne.mockResolvedValue(null);
      
      await expect(service.findOne('users', '999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

## 4. Integration Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('CrudController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Login to get token
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    authToken = body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /crud/users - should return paginated list', () => {
    return request(app.getHttpServer())
      .get('/crud/users?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

## 5. Quy tắc Testing

### MUST test
- Mọi public service method
- Guard logic (allow/deny)
- Validation DTOs
- Error paths (404, 400, 401, 403)
- Edge cases (empty data, null values, boundary values)

### SHOULD test
- Interceptors
- Database adapter methods
- AI skill `canHandle()` logic

### Mock Guidelines
- Mock database layer cho unit tests
- Mock LLM calls cho AI skill tests
- Dùng test database (SQLite hoặc Docker) cho integration
- KHÔNG mock the thing you're testing

### Coverage Target
- Minimum: **80%** line coverage
- Critical paths: **90%+** coverage
- AI skills: test `canHandle()` + response format

## 6. Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Specific file
npx jest src/modules/crud/crud.service.spec.ts

# E2E tests
npm run test:e2e
```

## 7. AI Skill Test Pattern

```typescript
describe('NestCodegenSkill', () => {
  let skill: NestCodegenSkill;

  beforeEach(() => {
    // setup with mocked LLM
  });

  describe('canHandle', () => {
    it('should handle NestJS code generation prompts', () => {
      expect(skill.canHandle({
        prompt: 'Tạo CRUD module cho products',
        projectContext: {} as any,
      })).toBe(true);
    });

    it('should not handle unrelated prompts', () => {
      expect(skill.canHandle({
        prompt: 'What is the weather?',
        projectContext: {} as any,
      })).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return proposedChanges with valid file paths', async () => {
      const result = await skill.execute({
        prompt: 'Tạo CRUD cho bảng products',
        projectContext: mockContext,
      });
      
      expect(result.proposedChanges).toBeDefined();
      expect(result.proposedChanges!.length).toBeGreaterThan(0);
      result.proposedChanges!.forEach(change => {
        expect(change.filePath).toBeTruthy();
        expect(['create', 'update', 'delete']).toContain(change.action);
      });
    });
  });
});
```
