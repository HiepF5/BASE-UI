## AI Builder Rules

### 1. Skill vs Tool

- **Tool**
  - Thao tác trực tiếp lên hệ thống: file, git, DB, CLI, test.
  - Không gọi LLM trực tiếp (nếu có thì phải rất rõ ràng).
  - Ví dụ:
    - `FileTool`: đọc/ghi file.
    - `GitTool`: commit, diff.
    - `SchemaTool`: đọc schema DB.

- **Skill**
  - Dùng LLM + Tool để thực hiện một nhiệm vụ cụ thể cho dev.
  - Ví dụ:
    - `NestCodegenSkill`: sinh CRUD module.
    - `NestDebugSkill`: phân tích lỗi Nest.
    - `DevopsGeneratorSkill`: sinh Dockerfile / CI.

### 2. Naming convention

- **Thư mục**
  - `backend/src/ai/tools/<tool-name>/`
  - `backend/src/ai/skills/<group-name>/`

- **File**
  - Tool: `<name>.tool.ts`  
    - Ví dụ: `file.tool.ts`, `git.tool.ts`.
  - Skill: `<domain>.skill.ts`  
    - Ví dụ: `nest-codegen.skill.ts`, `schema-ui-generator.skill.ts`.

- **Skill meta.id**
  - Format: `{group}.{domain}[.variant]`
  - Ví dụ:
    - `codegen.nest.crud`
    - `debug.nest.dependency`
    - `planning.generic`

### 3. Flow chuẩn từ frontend

1. User nhập yêu cầu ở UI chat.
2. Frontend gọi `POST /ai/execute`:
   - `userInput`
   - optional: `preferredSkillId` hoặc `mode`.
3. Backend:
   - Orchestrator chọn Skill (dựa trên `canHandle` + planner).
   - Skill trả về `messages` + `proposedChanges`.
4. Frontend hiển thị diff:
   - User chọn **Apply** hoặc **Discard**.
5. Nếu Apply:
   - Frontend gọi `POST /ai/apply` với `FileChange[]`.
   - Backend dùng `ApplyFileChangeSkill` + `FileTool` viết file thật.

### 4. Quy tắc an toàn

- Không auto-apply thay đổi file, luôn cần user confirm qua diff.
- Mặc định không chạy lệnh nguy hiểm (`rm`, `DROP TABLE`, ...) qua `ExecTool`.
- Log đầy đủ:
  - Prompt gửi LLM (đã ẩn secret).
  - File đã sửa.
  - Plan đã thực hiện.

### 5. Memory / Context

- Lưu lại:
  - Tech stack: NestJS, React, DB, ...
  - Convention: kiểu đặt tên, structure module.
  - Các module đã generate.
- Được truy cập qua `AiContextService`.

