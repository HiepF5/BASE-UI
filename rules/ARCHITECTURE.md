## AI Builder Architecture

This project is a personal AI Builder composed of:

- **Backend**: `NestJS`
- **Frontend**: `Vite + React`
- **AI Layer**: Planner + Executor + Context + Tools + Skills

### 1. Monorepo layout

```txt
ai-builder/
  backend/
  frontend/
  ARCHITECTURE.md
  ai-builder.config.json
  docs/
```

### 2. Backend layout (NestJS)

```txt
backend/src/
  main.ts
  app.module.ts

  ai/
    ai.module.ts
    ai.controller.ts
    ai.service.ts

    core/
      ai-orchestrator.service.ts
      ai-context.service.ts
      llm/
        llm.provider.ts
        prompts/
          codegen.prompt.ts
          planning.prompt.ts
          debug.prompt.ts

    tools/
      file/
        file.tool.ts
      git/
        git.tool.ts
      exec/
        exec.tool.ts
      schema/
        schema.tool.ts
      test/
        test.tool.ts

    skills/
      base/
        ai-skill.interface.ts
        skill-context.interface.ts
      code-generation/
        nest-codegen.skill.ts
        react-codegen.skill.ts
        form-codegen.skill.ts
      project-understanding/
        project-analyzer.skill.ts
      filesystem/
        apply-file-change.skill.ts
      ast-refactor/
        ast-refactor.skill.ts
      schema-aware/
        schema-ui-generator.skill.ts
      planning/
        planning.skill.ts
      devops/
        devops-generator.skill.ts
      debug/
        nest-debug.skill.ts
```

### 3. Frontend layout (Vite + React)

```txt
frontend/src/
  main.tsx
  App.tsx

  features/ai-chat/
    components/
      ChatPanel.tsx
      MessageList.tsx
      InputBox.tsx
    hooks/
      useAiChat.ts
    api/
      aiClient.ts

  features/code-preview/
    components/
      CodePreview.tsx
      DiffViewer.tsx

  features/file-explorer/
    components/
      FileExplorer.tsx

  store/
    aiSession.store.ts

  types/
    ai.ts
```

### 4. Core concepts

- **Planner**: phân tích yêu cầu lớn, sinh kế hoạch gồm nhiều bước.
- **Executor**: chọn Skill phù hợp và gọi Tool để thực thi.
- **Context Manager**: lưu memory (project summary, tech stack, convention).
- **Skill**: logic AI cho từng nhiệm vụ (codegen, debug, devops, ...).
- **Tool**: hành động thực tế (file, git, DB, CLI, test).

