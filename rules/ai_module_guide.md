# AI Module Development Guide

## 1. Tổng quan AI Module

AI Module nằm ở `server/src/modules/ai/` — cung cấp AI-powered code generation, debugging, planning, và project analysis.

### Cấu trúc
```
ai/
├── ai.module.ts              # Đăng ký tất cả skills + tools
├── ai.controller.ts          # REST endpoints
├── ai.service.ts             # Delegate tới orchestrator
├── core/
│   ├── ai-orchestrator.service.ts  # Skill selection logic
│   ├── ai-context.service.ts       # Project context memory
│   └── llm/
│       ├── llm.provider.ts         # OpenAI-compatible LLM client
│       └── prompts/                # System prompts per skill
├── skills/
│   ├── base/                       # AiSkill interface
│   ├── code-generation/            # nest-codegen, react-codegen, form-codegen
│   ├── project-understanding/      # project-analyzer
│   ├── filesystem/                 # apply-file-change
│   ├── ast-refactor/               # AST-based refactoring
│   ├── schema-aware/               # DB schema → UI generator
│   ├── planning/                   # Multi-step planning
│   ├── devops/                     # Docker, CI/CD generator
│   └── debug/                      # NestJS error analyzer
└── tools/
    ├── file/                       # File CRUD
    ├── git/                        # Git operations
    ├── exec/                       # Safe CLI execution
    ├── schema/                     # DB schema reader
    └── test/                       # Test runner
```

## 2. AiSkill Interface

```typescript
interface AiSkill {
  name: string;
  description: string;
  
  /** Decide if this skill can handle the prompt */
  canHandle(context: SkillContext): boolean;
  
  /** Execute the skill */
  execute(context: SkillContext): Promise<SkillResult>;
}

interface SkillContext {
  prompt: string;
  projectContext: ProjectContext;
  history?: AiMessage[];
}

interface SkillResult {
  response: string;
  proposedChanges?: FileChange[];
  plan?: string[];
  metadata?: Record<string, any>;
}
```

## 3. Quy trình tạo Skill mới

### Step 1: Tạo file skill
```
server/src/modules/ai/skills/my-skill/my-skill.skill.ts
```

### Step 2: Implement interface
```typescript
import { Injectable } from '@nestjs/common';
import { AiSkill, SkillContext, SkillResult } from '../base/skill.interface';
import { LlmProvider } from '../../core/llm/llm.provider';

@Injectable()
export class MySkill implements AiSkill {
  name = 'my-skill';
  description = 'Mô tả skill';

  constructor(private readonly llm: LlmProvider) {}

  canHandle(context: SkillContext): boolean {
    const keywords = ['my-keyword', 'related-term'];
    const prompt = context.prompt.toLowerCase();
    return keywords.some(kw => prompt.includes(kw));
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    // 1. Build system prompt
    // 2. Call LLM
    // 3. Parse response
    // 4. Return SkillResult
  }
}
```

### Step 3: Register trong ai.module.ts
```typescript
providers: [
  // ... existing
  MySkill,
]
```

### Step 4: Orchestrator tự pick skill qua `canHandle()`

## 4. AI Tools

Tools cung cấp side-effect capabilities cho skills.

### FileTool
- `readFile(path)` — đọc file (có path traversal protection)
- `writeFile(path, content)` — ghi file
- `deleteFile(path)` — xóa file
- `listFiles(dir, pattern?)` — list directory

### GitTool
- `status()` — git status
- `diff(file?)` — git diff
- `commit(message)` — git commit
- `log(count?)` — git log

### ExecTool
- `run(command)` — chạy CLI (có blocklist: rm -rf, format, etc.)
- `npmInstall(packages)` — npm install
- `npmRun(script)` — npm run script

### SchemaTool
- `getSchema(table)` — DB schema columns + relations
- `getAllTables()` — list tables
- `getPrismaSchema()` — read Prisma schema file

### TestTool
- `runTests(pattern?)` — chạy Jest tests
- `runSingleTest(file)` — chạy 1 test file

## 5. Quy tắc security

- Tools PHẢI validate input (path traversal, SQL injection)
- ExecTool có blocklist command (rm, format, shutdown, etc.)
- FileTool giới hạn read/write trong project root
- LLM responses cần sanitize trước khi apply
- KHÔNG cho phép AI execute arbitrary system commands

## 6. Prompt Engineering

- Mỗi skill có system prompt riêng trong `core/llm/prompts/`
- System prompt PHẢI include project context (tech stack, file structure)
- Sử dụng few-shot examples cho code generation
- Response format: JSON structured (proposedChanges, plan)

## 7. Thêm Tool mới

1. Tạo `server/src/modules/ai/tools/my-tool/my-tool.tool.ts`
2. Implement class với `@Injectable()`
3. Register trong `ai.module.ts`
4. Inject vào skills cần dùng
