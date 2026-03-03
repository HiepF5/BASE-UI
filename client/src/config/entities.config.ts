import type { EntityConfig } from '../types';

// ============================================================
// Entities Config - Metadata-driven entity registry
// Điều khiển UI rendering, permissions, columns
// ============================================================
export const EntitiesConfig: Record<string, EntityConfig> = {
  users: {
    name: 'users',
    label: 'Users',
    icon: '👤',
    permissions: { read: true, create: true, update: true, delete: true },
    columns: [
      { name: 'id', label: 'ID', type: 'text', visible: true, sortable: true, filterable: false, editable: false, required: false },
      { name: 'username', label: 'Username', type: 'text', visible: true, sortable: true, filterable: true, editable: true, required: true },
      { name: 'email', label: 'Email', type: 'email', visible: true, sortable: true, filterable: true, editable: true, required: true },
      { name: 'role', label: 'Role', type: 'select', visible: true, sortable: true, filterable: true, editable: true, required: true, options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Viewer', value: 'viewer' },
      ]},
      { name: 'created_at', label: 'Created', type: 'date', visible: true, sortable: true, filterable: true, editable: false, required: false },
    ],
  },
};
