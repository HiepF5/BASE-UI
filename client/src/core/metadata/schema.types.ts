// ============================================================
// Schema Types - Core metadata format cho Metadata Engine
// Defines EntitySchema, FieldSchema, RelationSchema, ValidationSchema
// Cho phép render UI từ metadata (Phase 2 – Week 4)
// ============================================================

// ─── Field Types ─────────────────────────────────────────────
/** All supported UI field types */
export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'email'
  | 'password'
  | 'url'
  | 'phone'
  | 'json'
  | 'relation';

// ─── Relation Types ──────────────────────────────────────────
/** Supported relation types */
export type RelationType = 'ManyToOne' | 'OneToMany' | 'ManyToMany' | 'OneToOne';

// ─── Validation Schema ───────────────────────────────────────
/** Validation config per field – generates Zod schema at runtime */
export interface ValidationSchema {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  /** Custom error messages per rule */
  messages?: {
    required?: string;
    min?: string;
    max?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    email?: string;
    url?: string;
  };
}

// ─── Select Option ───────────────────────────────────────────
export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// ─── Relation Schema ─────────────────────────────────────────
/** Relation metadata per field */
export interface RelationFieldSchema {
  /** Relation type */
  type: RelationType;
  /** Target entity name (table name or entity key) */
  target: string;
  /** Field on target entity to display in select/label */
  displayField: string;
  /** Foreign key column (on source or junction table) */
  foreignKey?: string;
  /** Junction table (for ManyToMany) */
  junctionTable?: string;
  /** Allow creating new related records inline */
  allowCreate?: boolean;
  /** Preload option count (for dropdowns) */
  preloadLimit?: number;
  /** Search field for async search (defaults to displayField) */
  searchField?: string;
}

// ─── Field Schema ────────────────────────────────────────────
/** Complete field definition (one column/field of an entity) */
export interface FieldSchema {
  /** Field name (column name / key) */
  name: string;
  /** Display label */
  label: string;
  /** UI field type */
  type: FieldType;
  /** Default value for create mode */
  defaultValue?: any;
  /** Placeholder text */
  placeholder?: string;

  // ─── Visibility ─────────
  /** Show in table */
  visibleInTable?: boolean;
  /** Show in create form */
  visibleInCreate?: boolean;
  /** Show in edit form */
  visibleInEdit?: boolean;
  /** Show in detail view */
  visibleInDetail?: boolean;
  /** Show in filter bar */
  filterable?: boolean;

  // ─── Behaviour ──────────
  /** Sortable in table */
  sortable?: boolean;
  /** Editable (false = read-only) */
  editable?: boolean;
  /** Is primary key */
  isPrimary?: boolean;
  /** Column width in table (px) */
  width?: number;

  // ─── Type-specific ──────
  /** Options for select / multiselect */
  options?: FieldOption[];
  /** Relation config (when type = 'relation') */
  relation?: RelationFieldSchema;

  // ─── Validation ─────────
  validation?: ValidationSchema;

  // ─── Rendering ──────────
  /** Custom render function name (registered in cellRenderers) */
  cellRenderer?: string;
  /** CSS class for table cell */
  cellClassName?: string;
  /** Help text shown below input */
  helpText?: string;
}

// ─── Entity Schema ───────────────────────────────────────────
/** Complete entity definition – drives DynamicTable + DynamicForm */
export interface EntitySchema {
  /** Entity key (table name or slug) */
  name: string;
  /** Display label (for page title, breadcrumbs) */
  label: string;
  /** Optional icon (emoji or Lucide icon name) */
  icon?: string;
  /** Description */
  description?: string;
  /** Primary key field name */
  primaryKey?: string;
  /** Display field (used when this entity is referenced by relation) */
  displayField?: string;

  /** Field definitions */
  fields: FieldSchema[];

  /** CRUD permissions */
  permissions?: {
    read?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    export?: boolean;
  };

  /** Default sort */
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  /** Default page size */
  defaultPageSize?: number;
  /** Available page sizes */
  pageSizes?: number[];

  /** API endpoint override (default: /crud/{connectionId}/{entity}) */
  apiEndpoint?: string;
}

// ─── Schema Registry ─────────────────────────────────────────
/** Registry of all entity schemas (config or auto-generated) */
export type SchemaRegistry = Record<string, EntitySchema>;

// ─── Backward Compatibility ──────────────────────────────────
/** Maps EntitySchema → old ColumnConfig (for existing BaseTable/BaseForm) */
export interface ColumnConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'password';
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  editable: boolean;
  required: boolean;
  width?: number;
  options?: Array<{ label: string; value: string }>;
  validation?: { min?: number; max?: number; pattern?: string; message?: string };
}
