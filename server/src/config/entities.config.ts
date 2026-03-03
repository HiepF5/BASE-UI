// ============================================================
// Entities Config - Whitelist & metadata cho dynamic CRUD
// ============================================================

export interface EntityColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'relation';
  required?: boolean;
  readonly?: boolean;
  hiddenInTable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  options?: Array<{ label: string; value: any }>;
  relation?: {
    entity: string;
    labelField: string;
    valueField: string;
  };
}

export interface EntityConfig {
  name: string;
  label: string;
  primaryKey: string;
  permissions: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  columns: EntityColumnConfig[];
}

/**
 * Entity whitelist - chỉ các entity được liệt kê ở đây
 * mới có thể truy cập qua CRUD API
 */
export const EntitiesConfig: Record<string, EntityConfig> = {
  users: {
    name: 'users',
    label: 'Users',
    primaryKey: 'id',
    permissions: {
      create: true,
      update: true,
      delete: false,
    },
    columns: [
      { key: 'id', label: 'ID', type: 'number', readonly: true },
      { key: 'email', label: 'Email', type: 'text', required: true, searchable: true },
      { key: 'name', label: 'Name', type: 'text', required: true, searchable: true },
      {
        key: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      },
    ],
  },
  // Thêm entity khác ở đây...
};
