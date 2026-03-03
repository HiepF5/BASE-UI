/**
 * Entity Config Registry
 * ─────────────────────
 * Đăng ký EntityConfig cho các bảng "cứng" (hard-coded).
 * Bảng dynamic sẽ tự sinh config từ DB schema thông qua useSchema.
 *
 * Theo rule: base_ui.md — "1 EntityConfig là 1 object mô tả đầy đủ
 * meta-data cho UI: columns (label, type, visible, sortable, filterable,
 * editable), permissions, relations, v.v."
 */

import type { EntityConfig } from '@/types';

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  /* ── Users ── */
  users: {
    name: 'users',
    label: 'Người dùng',
    icon: 'Users',
    primaryKey: 'id',
    permissions: { read: true, create: true, update: true, delete: true },
    columns: [
      { name: 'id',       label: 'ID',          type: 'text',     visible: true, sortable: true,  filterable: false, editable: false, required: false },
      { name: 'username', label: 'Tên đăng nhập', type: 'text',   visible: true, sortable: true,  filterable: true,  editable: true,  required: true, validation: { minLength: 3, maxLength: 50 } },
      { name: 'email',    label: 'Email',        type: 'email',   visible: true, sortable: true,  filterable: true,  editable: true,  required: false },
      { name: 'role',     label: 'Vai trò',      type: 'select',  visible: true, sortable: true,  filterable: true,  editable: true,  required: true, options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ]},
    ],
    defaultSort: [{ field: 'username', direction: 'asc' }],
    defaultPageSize: 25,
  },

  /* ── Connections ── */
  connections: {
    name: 'connections',
    label: 'Kết nối DB',
    icon: 'Plug',
    primaryKey: 'id',
    permissions: { read: true, create: true, update: true, delete: true },
    columns: [
      { name: 'id',       label: 'ID',       type: 'text',   visible: false, sortable: false, filterable: false, editable: false, required: false },
      { name: 'name',     label: 'Tên',      type: 'text',   visible: true,  sortable: true,  filterable: true,  editable: true,  required: true },
      { name: 'type',     label: 'DB Type',  type: 'select', visible: true,  sortable: true,  filterable: true,  editable: true,  required: true, options: [
        { label: 'PostgreSQL', value: 'postgres' },
        { label: 'MySQL', value: 'mysql' },
        { label: 'Oracle', value: 'oracle' },
      ]},
      { name: 'host',     label: 'Host',     type: 'text',   visible: true,  sortable: false, filterable: false, editable: true,  required: true },
      { name: 'port',     label: 'Port',     type: 'number', visible: true,  sortable: false, filterable: false, editable: true,  required: true },
      { name: 'database', label: 'Database', type: 'text',   visible: true,  sortable: false, filterable: false, editable: true,  required: true },
      { name: 'status',   label: 'Trạng thái', type: 'text', visible: true,  sortable: true,  filterable: true,  editable: false, required: false },
    ],
    defaultSort: [{ field: 'name', direction: 'asc' }],
  },
};

/**
 * Get entity config by name.
 * Returns undefined if not registered (will fallback to schema-derived config).
 */
export function getEntityConfig(name: string): EntityConfig | undefined {
  return ENTITY_CONFIGS[name];
}

/**
 * List all registered entity names.
 */
export function getRegisteredEntities(): string[] {
  return Object.keys(ENTITY_CONFIGS);
}
