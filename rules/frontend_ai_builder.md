## Frontend AI Builder Rules (Vite + React)

- **Scope**
  - Frontend is a **thin AI client**: UI, session state, and visualization of AI outputs.
  - All heavy reasoning, file access, and code execution stay on the backend AI layer.

- **Directory layout**
  - Keep AI‑related frontend code under `frontend/src/features/ai-*` or `frontend/src/ai/*`.
  - Separate concerns:
    - `components/`: pure-presentational UI
    - `hooks/`: stateful logic (e.g. `useAiChat`, `useAiSession`)
    - `api/`: HTTP/WebSocket client for backend AI

- **State management**
  - Store AI session state in a dedicated store (e.g. `aiSession.store.ts`): messages, steps, selected skill, status.
  - Keep store schema stable so backend can safely reference it (via tools/skills when needed).
  - Persist only what’s necessary (avoid leaking secrets or large payloads into localStorage).

- **AI UX patterns**
  - Always show **streaming** feedback (typing indicator / progress steps) for long‑running AI tasks.
  - Make AI actions **explicit**: user chooses skill/task (codegen, refactor, explain) instead of a single “magic” button.
  - Allow user to inspect diffs before applying code changes (code preview + inline diff viewer).

- **Safety & confirmation**
  - For any file‑changing / git‑changing operation triggered from the UI:
    - Show a clear summary of what will change.
    - Require explicit confirmation (and ideally show a diff).

- **Type safety**
  - Define shared types for AI requests/responses in `frontend/src/types/ai.ts` and keep them in sync with backend contracts.
  - Never use `any` for AI payloads; narrow them with discriminated unions where possible.

- **Extensibility**
  - When adding new frontend AI skills/tools, register them in `ai-builder.config.json` (group = `frontend`).
  - Keep components generic (e.g. `CodePreview`, `DiffViewer`, `ChatPanel`) and drive behavior via props + metadata.

