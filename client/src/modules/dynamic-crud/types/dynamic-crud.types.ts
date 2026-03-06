// ============================================================
// Dynamic CRUD Types
// ============================================================

import type { EntitySchema } from '../../../core/metadata/schema.types';
import type { SortOption, FilterGroup } from '../../../types';

// ── List View Props ─────────────────────────────────────────

export interface DynamicListViewProps {
  /** Entity schema */
  schema: EntitySchema;
  /** Table data */
  data: Record<string, unknown>[];
  /** Total records */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  limit: number;
  /** Current sort */
  sort: SortOption[];
  /** Selected row IDs */
  selectedRows: string[];
  /** Search text */
  search: string;
  /** Loading state */
  loading?: boolean;
  /** Fetching new page (still has old data) */
  isFetching?: boolean;

  // ─── Permissions ────────
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;

  // ─── Handlers ───────────
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort: (sort: SortOption[]) => void;
  onFilter: (filter: FilterGroup | null) => void;
  onSearch: (text: string) => void;
  onRowSelect: (ids: string[]) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  onCreate?: () => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onBulkDelete?: () => void;
  onRefresh?: () => void;
}

// ── Create Modal Props ──────────────────────────────────────

export interface DynamicCreateModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Entity schema (metadata) */
  schema: EntitySchema;
  /** Submit handler (receives cleaned form data) */
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  /** Loading state (create in progress) */
  loading?: boolean;
  /** Relation options: { fieldName: options[] } */
  relationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  /** Relation loading: { fieldName: boolean } */
  relationLoading?: Record<string, boolean>;
}

// ── Edit Modal Props ────────────────────────────────────────

export interface DynamicEditModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Entity schema (metadata) */
  schema: EntitySchema;
  /** Row data to edit (used as defaultValues) */
  data: Record<string, unknown> | null;
  /** Submit handler (receives cleaned form data) */
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  /** Loading state (update in progress) */
  loading?: boolean;
  /** Relation options: { fieldName: options[] } */
  relationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  /** Relation loading: { fieldName: boolean } */
  relationLoading?: Record<string, boolean>;
}

// ── Delete Dialog Props ─────────────────────────────────────

export interface DeleteConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Close the dialog */
  onClose: () => void;
  /** Confirm deletion */
  onConfirm: () => void;
  /** Loading state (deletion in progress) */
  loading?: boolean;
  /** Title override */
  title?: string;
  /** Custom message */
  message?: React.ReactNode;
  /** Entity label (for default message) */
  entityLabel?: string;
  /** Number of items to delete (for bulk) */
  count?: number;
}

// ── Page Props ──────────────────────────────────────────────

export interface DynamicCrudPageProps {
  /** Static entity name (alternative to route param) */
  entityName?: string;
  /** Connection ID override */
  connectionId?: string;
}
