## Backend AI Builder Rules (NestJS)

- **Module location**
  - AI module is registered at `backend/src/ai/ai.module.ts` (or equivalent in the Nest app).
  - Keep all AI-related providers inside `ai/` to avoid leaking concerns into business modules.

- **Skill structure**
  - Each Skill lives under `backend/src/ai/skills/<group>/<name>.skill.ts`.
  - A Skill should be **pure orchestration + prompting**, all side-effects must go through a Tool.
  - Keep skills small and composable: one responsibility per skill (codegen, debug, devops, planning, ...).

- **Tool usage**
  - Tools live under `backend/src/ai/tools/<tool>/<tool>.tool.ts`.
  - Tools must implement **idempotent, deterministic** behavior where possible (especially for file + git).
  - Never mix direct filesystem / git access inside skills; always go through a Tool.

- **Planner / Executor**
  - Planner decides *what* to do (high-level steps) and *which Skill* to use per step.
  - Executor runs skills step‑by‑step, persists context (summary, project map, decisions) between calls.
  - Always include: current goal, constraints, and safety checks in prompts (no destructive git, no secrets).

- **Prompt hygiene**
  - Centralize base prompts in `backend/src/ai/core/llm/prompts/*` and reuse across skills.
  - Use clear sections: `Goal`, `Context`, `Tools`, `Output format`.
  - Prefer structured JSON/YAML outputs for anything machine‑parsed.

- **Error handling & logging**
  - Log every Planner/Executor run with: request id, user, skill id, tools used, duration, status.
  - Wrap LLM errors, tool failures, and validation errors into typed Nest exceptions.

- **Security**
  - Never allow arbitrary shell/git/file commands; only whitelisted operations through tools.
  - Validate all incoming AI requests (authz: user, role, environment).

