## Project Tool & Skill Guidelines

Tập tài liệu này tổng hợp phong cách của **Claude-like AI**, **React Best Practices** và **Web Design Guidelines** để chuẩn hóa cách AI Builder dùng Tool/Skill trong dự án này.

---

## 1. Nguyên tắc ứng xử của AI (Claude-style)

- **Luôn có kế hoạch ngắn trước khi hành động**
  - Nêu 2–5 gạch đầu dòng: mục tiêu, bước tiếp theo.
  - Không “tán rộng”, ưu tiên hành động cụ thể.
- **Trả lời có cấu trúc**
  - Dùng heading `###`, bullet, bold cho ý chính.
  - Code luôn trong code block, kèm chú thích ngắn gọn.
- **An toàn & tối thiểu xâm lấn**
  - Không tự ý xóa nhiều file; nếu cần, yêu cầu confirm.
  - Luôn tạo diff rõ ràng, tránh ghi đè file lớn khi chưa cần.
- **Context-aware**
  - Đọc cấu trúc project trước khi generate.
  - Tôn trọng convention hiện có (tên file, tên folder, style code).

---

## 2. Tool Guidelines (File, Git, Exec, Schema, Test)

### 2.1 FileTool

- **Chức năng chính**:
  - Đọc file, ghi file, list directory.
  - Được dùng bởi hầu hết Skill (codegen, refactor, debug).
- **Quy tắc dùng**:
  - Không ghi đè file mà không đưa vào `proposedChanges` cho UI diff trước.
  - Khi tạo module/component mới:
    - Luôn đảm bảo thư mục tồn tại (`ensureDir`).
    - Tên file theo convention: kebab-case cho file, PascalCase cho component.

### 2.2 GitTool

- **Chức năng**:
  - Xem `status`, `diff`, tạo commit nhỏ.
- **Quy tắc**:
  - Không tự commit trừ khi user yêu cầu rõ ràng.
  - Ưu tiên commit nhỏ, theo chức năng (1 skill / 1 commit).

### 2.3 ExecTool

- **Chức năng**:
  - Chạy lệnh CLI: `npm install`, `npm test`, `nest g`, ...
- **Quy tắc an toàn**:
  - Chỉ chạy lệnh **idempotent / không phá dữ liệu**:
    - OK: `npm install`, `npm run build`, `npm test`.
    - Hạn chế: lệnh có `rm`, `drop`, `migrate` phá hủy dữ liệu → cần confirm.

### 2.4 SchemaTool

- **Chức năng**:
  - Đọc schema từ DB hoặc từ Prisma/TypeORM models.
- **Quy tắc**:
  - Không chỉnh DB schema trực tiếp trừ khi được yêu cầu.
  - Output chủ yếu dùng cho:
    - Sinh entity/model.
    - Sinh form + table UI.

### 2.5 TestTool

- **Chức năng**:
  - Chạy test (`npm test`, `jest`, `vitest`).
  - Có thể trigger generate test case từ LLM.
- **Quy tắc**:
  - Ưu tiên chạy test scope nhỏ (file/module liên quan).
  - Log kết quả gọn: số test pass/fail, link file test.

---

## 3. React Best Practices (Skill định hướng frontend)

### 3.1 Cấu trúc component & folder

- **Layout đề xuất**:
  - `src/components/common/` – button, input, modal, form-control.
  - `src/features/<domain>/components/` – UI đặc thù của domain.
  - `src/features/<domain>/hooks/` – custom hooks cho domain.
  - `src/features/<domain>/api/` – hàm gọi API (NestJS backend).
  - `src/store/` – Zustand/Redux store chia theo domain.
- **Quy tắc skill codegen**:
  - Không generate component khổng lồ; tách nhỏ:
    - Page container
    - List/table
    - Form

### 3.2 State management

- Ưu tiên:
  - **Local state** cho UI đơn giản.
  - **Zustand** cho global state sạch, typed.
- Skill khi generate:
  - Không tự thêm Redux nếu project chưa dùng Redux.
  - Tôn trọng store đang tồn tại (nếu có).

### 3.3 Hooks & side-effect

- Quy tắc:
  - Dùng `useEffect` đúng dependency, tránh infinite loop.
  - Custom hooks bắt đầu bằng `useXxx`, đặt trong `hooks/`.
  - Không gọi hook trong condition/loop.

---

## 4. Web Design Guidelines (cho Skill UI/Component Generator)

### 4.1 Layout & spacing

- **Spacing chuẩn**:
  - Base unit: `4px` hoặc `8px`.
  - Section padding: `24–32px`.
  - Khoảng cách giữa control form: `8–12px`.
- **Layout**:
  - Sử dụng flex/grid thay vì absolute nếu không cần thiết.
  - Responsive: tối thiểu 2 breakpoints (mobile, desktop).

### 4.2 Typography & color

- Typography:
  - 3–4 cấp độ: `h1`, `h2`, `body`, `caption`.
  - Font-size thân bài: 14–16px.
- Color:
  - Palette giới hạn: primary, secondary, success, warning, error, background.
  - Đảm bảo contrast đủ để đọc (WCAG-friendly).

### 4.3 UX cho AI Builder UI

- Flow chuẩn:
  1. User nhập yêu cầu trong chat.
  2. Hiển thị kết quả: log + danh sách file thay đổi.
  3. Cho phép xem diff từng file.
  4. Nút **Apply** / **Discard** cho từng file hoặc toàn bộ.
- Component bắt buộc:
  - Chat panel (history, loading state, error state).
  - File change list (tên file, trạng thái: create/update/delete).
  - Diff viewer (before/after).

---

## 5. Mapping Tool ↔ Skill theo guideline này

- **Code generation skills**:
  - Dùng: `FileTool`, context project (convention, folder).
  - Theo React & web-design guideline khi sinh UI.
- **Refactor / Debug skills**:
  - Dùng: `FileTool`, AST (ts-morph), đôi khi `TestTool`.
  - Không thay đổi nhiều file một lúc nếu không cần.
- **Schema-aware skills**:
  - Dùng: `SchemaTool` + `FileTool`.
  - Sinh API + UI tôn trọng guideline React + UX (form + table).
- **DevOps skills**:
  - Dùng: `FileTool` (Dockerfile, CI).
  - Tuyệt đối không chạy lệnh phá hủy môi trường qua `ExecTool` trừ khi confirm.

