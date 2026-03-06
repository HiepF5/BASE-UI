import type { ExampleEntity } from '../types/example-app.types';

// ============================================================
// example-app config
// Configuration constants for the example app module
// ============================================================

// ─── LocalStorage Key for Saved Filters ───────────────────
export const SAVED_FILTERS_KEY = 'base-ui-saved-filters';

// ─── Example Entities ─────────────────────────────────────
export const EXAMPLE_ENTITIES: ExampleEntity[] = [
  {
    key: 'users',
    label: 'Users',
    icon: '👤',
    description: 'System users management',
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: '📦',
    description: 'Customer orders with relations',
  },
  {
    key: 'order_items',
    label: 'Order Items',
    icon: '🛒',
    description: 'Line items within orders',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: '📁',
    description: 'Self-referencing category tree',
  },
];

// ─── Default Configuration ────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_MOCK_DATA_COUNT = 85;
