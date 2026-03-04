import type { EntitySchema } from '../core/metadata/schema.types';

// ============================================================
// Template Config – Copy this file to create a new entity config
// Phase 5 – DX: Template config
//
// Usage:
//   1. Copy this file to client/src/config/<your_entity>.schema.ts
//   2. Rename TemplateSchema → YourEntitySchema
//   3. Customize fields, relations, validation, permissions
//   4. Register in schema.config.ts → schemaRegistry
//   5. Add route in App.tsx + nav in AdminLayout.tsx
//
// The config-driven engine will auto-render:
//   - Table columns with type-aware cell renderers
//   - Create/Edit forms with Zod validation
//   - Filter builder with metadata-driven operators
//   - Relation dropdowns/inline tables
//   - Pagination with configurable page size
// ============================================================

export const TemplateSchema: EntitySchema = {
  // ─── Identity ────────────────────────────────────────────
  /** Unique entity name (matches API endpoint & DB table) */
  name: 'your_entity',
  /** Human-readable label (shown in UI headings) */
  label: 'Your Entity',
  /** Short description (optional, shown under headings) */
  description: 'Manage your entity records',
  /** Emoji or icon identifier */
  icon: '📄',

  // ─── Table Settings ──────────────────────────────────────
  /** Primary key field name */
  primaryKey: 'id',
  /** Field used for display in relation dropdowns */
  displayField: 'name',
  /** Default sort on first load */
  defaultSort: { field: 'created_at', direction: 'desc' },
  /** Default page size */
  defaultPageSize: 20,

  // ─── Fields ──────────────────────────────────────────────
  fields: [
    // ── Primary key ──
    {
      name: 'id',
      label: 'ID',
      type: 'number',
      isPrimary: true,
      visibleInTable: true,
      visibleInCreate: false,
      visibleInEdit: false,
      sortable: true,
    },

    // ── Text field ──
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      sortable: true,
      filterable: true,
      validation: {
        required: true,
        minLength: 1,
        maxLength: 255,
        messages: {
          required: 'Name is required',
          maxLength: 'Name must be under 255 characters',
        },
      },
      placeholder: 'Enter name',
      // helpText: 'A unique name for this record',
    },

    // ── Email field ──
    // {
    //   name: 'email',
    //   label: 'Email',
    //   type: 'email',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   filterable: true,
    //   validation: { required: true, email: true },
    // },

    // ── Number field ──
    // {
    //   name: 'amount',
    //   label: 'Amount',
    //   type: 'number',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   sortable: true,
    //   filterable: true,
    //   validation: { min: 0, max: 999999 },
    // },

    // ── Boolean field ──
    // {
    //   name: 'is_active',
    //   label: 'Active',
    //   type: 'boolean',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   filterable: true,
    // },

    // ── Select field ──
    // {
    //   name: 'status',
    //   label: 'Status',
    //   type: 'select',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   filterable: true,
    //   options: [
    //     { label: 'Draft', value: 'draft' },
    //     { label: 'Active', value: 'active' },
    //     { label: 'Archived', value: 'archived' },
    //   ],
    //   validation: { required: true },
    // },

    // ── Textarea field ──
    // {
    //   name: 'description',
    //   label: 'Description',
    //   type: 'textarea',
    //   visibleInTable: false,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   validation: { maxLength: 2000 },
    // },

    // ── Date field ──
    // {
    //   name: 'due_date',
    //   label: 'Due Date',
    //   type: 'date',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   sortable: true,
    //   filterable: true,
    // },

    // ── Relation: ManyToOne (dropdown) ──
    // {
    //   name: 'category_id',
    //   label: 'Category',
    //   type: 'relation',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   filterable: true,
    //   relation: {
    //     type: 'ManyToOne',
    //     target: 'categories',     // target entity name
    //     displayField: 'name',     // shown in dropdown
    //     foreignKey: 'category_id',
    //     preloadLimit: 100,        // max options to preload
    //     allowCreate: false,       // allow inline creation
    //   },
    // },

    // ── Relation: OneToMany (inline table) ──
    // {
    //   name: 'items',
    //   label: 'Items',
    //   type: 'relation',
    //   visibleInTable: false,
    //   visibleInCreate: false,
    //   visibleInEdit: true,         // shown as inline table in edit form
    //   relation: {
    //     type: 'OneToMany',
    //     target: 'order_items',
    //     foreignKey: 'order_id',
    //     displayField: 'product_name',
    //   },
    // },

    // ── Relation: ManyToMany (multi-select) ──
    // {
    //   name: 'tags',
    //   label: 'Tags',
    //   type: 'relation',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   relation: {
    //     type: 'ManyToMany',
    //     target: 'tags',
    //     displayField: 'name',
    //     pivotTable: 'entity_tags',
    //     pivotSourceKey: 'entity_id',
    //     pivotTargetKey: 'tag_id',
    //   },
    // },

    // ── Self-relation (tree structure) ──
    // {
    //   name: 'parent_id',
    //   label: 'Parent',
    //   type: 'relation',
    //   visibleInTable: true,
    //   visibleInCreate: true,
    //   visibleInEdit: true,
    //   relation: {
    //     type: 'ManyToOne',
    //     target: 'your_entity',    // same entity = self-relation
    //     displayField: 'name',
    //     foreignKey: 'parent_id',
    //   },
    // },

    // ── Timestamps ──
    {
      name: 'created_at',
      label: 'Created At',
      type: 'datetime',
      visibleInTable: true,
      visibleInCreate: false,
      visibleInEdit: false,
      sortable: true,
    },
    // {
    //   name: 'updated_at',
    //   label: 'Updated At',
    //   type: 'datetime',
    //   visibleInTable: false,
    //   visibleInCreate: false,
    //   visibleInEdit: false,
    // },
  ],

  // ─── Permissions ─────────────────────────────────────────
  permissions: {
    create: true,
    update: true,
    delete: true,
    export: false,
  },
};
