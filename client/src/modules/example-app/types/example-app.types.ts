import type { FilterGroupNode } from '../../../core/query-builder';
import type { EntitySchema } from '../../../core/metadata/schema.types';

// ============================================================
// example-app types
// Type definitions for the example app module
// ============================================================

// ─── Saved Filter ─────────────────────────────────────────
export interface SavedFilter {
  id: string;
  name: string;
  entity: string;
  filter: FilterGroupNode;
  createdAt: string;
}

// ─── Example Entity Configuration ─────────────────────────
export interface ExampleEntity {
  key: string;
  label: string;
  icon: string;
  description: string;
}

// ─── Example App State ────────────────────────────────────
export interface ExampleAppState {
  activeEntity: string;
  schema: EntitySchema | undefined;
  page: number;
  limit: number;
  search: string;
  selectedRows: string[];
  createOpen: boolean;
  editingRow: Record<string, unknown> | null;
  deleteRow: Record<string, unknown> | null;
  showConfig: boolean;
  showFilterPanel: boolean;
  showSaveDialog: boolean;
  filterName: string;
}

// ─── Props Types ──────────────────────────────────────────
export interface EntitySelectorProps {
  entities: ExampleEntity[];
  activeEntity: string;
  onSelect: (key: string) => void;
}

export interface FilterPanelProps {
  schema: EntitySchema;
  filterAST: FilterGroupNode;
  onFilterChange: (filter: FilterGroupNode) => void;
  onApply: () => void;
  onClear: () => void;
  onSave: () => void;
  savedFilters: SavedFilter[];
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
  conditionCount: number;
}

export interface SaveFilterDialogProps {
  open: boolean;
  onClose: () => void;
  filterName: string;
  onFilterNameChange: (name: string) => void;
  onSave: () => void;
  filterAST: FilterGroupNode;
  conditionCount: number;
}

export interface EntityHeaderProps {
  schema: EntitySchema;
  showFilterPanel: boolean;
  hasActiveFilter: boolean;
  canCreate: boolean;
  onToggleFilter: () => void;
  onCreate: () => void;
}

export interface SearchBarProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export interface ActiveFilterBannerProps {
  conditionCount: number;
  sqlPreview: string;
  onEdit: () => void;
  onClear: () => void;
}

export interface ConfigBannerProps {
  schema: EntitySchema;
  showConfig: boolean;
  onToggle: () => void;
}
