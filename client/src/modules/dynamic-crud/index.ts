// ============================================================
// dynamic-crud module
// Metadata-driven CRUD operations for any entity
// ============================================================

// ─── Pages ────────────────────────────────────────────────
export { DynamicCrudPage } from './pages';

// ─── Components ───────────────────────────────────────────
export {
  DynamicListView,
  DynamicCreateModal,
  DynamicEditModal,
  DeleteConfirmDialog,
} from './components';

// ─── Hooks ────────────────────────────────────────────────
export { useDynamicCrud } from './hooks/useDynamicCrud';

// ─── Types ────────────────────────────────────────────────
export type {
  DynamicListViewProps,
  DynamicCreateModalProps,
  DynamicEditModalProps,
  DeleteConfirmDialogProps,
  DynamicCrudPageProps,
} from './types/dynamic-crud.types';
