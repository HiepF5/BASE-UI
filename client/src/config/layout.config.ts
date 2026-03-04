// ============================================================
// Layout Config — Config-driven layout metadata
// Drives sidebar menu, header, breadcrumbs, permissions
// Screen 0: GLOBAL LAYOUT (Base Shell)
// ============================================================

/**
 * A single menu item in the sidebar.
 * `requiredRole` gates visibility by user role.
 * `requiredPermission` gates by fine-grained permission key.
 */
export interface MenuItemConfig {
  to: string;
  label: string;
  icon: string;
  /** Show only for these roles (empty = all) */
  requiredRoles?: string[];
  /** Show only if user has this permission key */
  requiredPermission?: string;
  /** Badge text (e.g. "New", count) */
  badge?: string;
  badgeColor?: 'primary' | 'danger' | 'warning' | 'success' | 'neutral';
  /** If true, item is hidden when sidebar is collapsed */
  hideWhenCollapsed?: boolean;
}

/** A section groups menu items under a heading */
export interface MenuSectionConfig {
  id: string;
  label: string;
  /** Collapse section by default */
  defaultCollapsed?: boolean;
  items: MenuItemConfig[];
}

/** Header configuration */
export interface HeaderConfig {
  title: string;
  showSearch: boolean;
  showThemeToggle: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
}

/** Breadcrumb mapping — route pattern to label */
export interface BreadcrumbConfig {
  pattern: string;
  label: string;
  icon?: string;
}

/** Full layout configuration */
export interface LayoutConfig {
  brand: {
    name: string;
    shortName: string;
    logo?: string;
  };
  header: HeaderConfig;
  sidebar: {
    defaultOpen: boolean;
    width: { expanded: string; collapsed: string };
    sections: MenuSectionConfig[];
  };
  breadcrumbs: BreadcrumbConfig[];
}

// ─── Default Layout Configuration ────────────────────────────

export const layoutConfig: LayoutConfig = {
  brand: {
    name: 'Admin Platform',
    shortName: 'AP',
  },

  header: {
    title: 'Metadata-Driven Admin Platform',
    showSearch: true,
    showThemeToggle: true,
    showNotifications: true,
    showUserMenu: true,
  },

  sidebar: {
    defaultOpen: true,
    width: { expanded: 'w-60', collapsed: 'w-16' },
    sections: [
      {
        id: 'main',
        label: 'Main',
        items: [{ to: '/dashboard', label: 'Dashboard', icon: '📊' }],
      },
      {
        id: 'showcase',
        label: 'Showcase',
        items: [
          { to: '/showcase/tokens', label: 'Design Tokens', icon: '🎨' },
          { to: '/showcase/components', label: 'Components', icon: '🧩' },
          { to: '/showcase/data-overlay', label: 'Data & Overlay', icon: '📊' },
          { to: '/showcase/metadata', label: 'Metadata Engine', icon: '🏗️' },
          { to: '/showcase/state', label: 'State Mgmt', icon: '🔄' },
        ],
      },
      {
        id: 'crud',
        label: 'CRUD Engine',
        items: [
          { to: '/showcase/crud', label: 'CRUD Engine', icon: '⚡' },
          { to: '/showcase/generic-list', label: 'Generic List', icon: '📋' },
          { to: '/showcase/generic-form', label: 'Generic Form', icon: '📝' },
          { to: '/showcase/relation', label: 'Relations', icon: '🔗' },
          {
            to: '/showcase/relation-nested-crud',
            label: 'Nested CRUD',
            icon: '🔗',
            badge: 'New',
            badgeColor: 'primary',
          },
        ],
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        items: [
          { to: '/showcase/query-builder', label: 'Query Builder', icon: '🔍' },
          { to: '/showcase/config-preview', label: 'Config Preview', icon: '🔧' },
          { to: '/showcase/bieu-lai-suat', label: 'Biểu Lãi Suất', icon: '💹' },
        ],
      },
      {
        id: 'platform',
        label: 'Platform',
        items: [
          {
            to: '/showcase/command-palette',
            label: 'Command Palette',
            icon: '🎯',
            badge: 'New',
            badgeColor: 'primary',
          },
          {
            to: '/showcase/activity-log',
            label: 'Activity Log',
            icon: '📋',
            badge: 'New',
            badgeColor: 'primary',
          },
          {
            to: '/showcase/screen-permissions',
            label: 'Screen Permissions',
            icon: '🔐',
            badge: 'New',
            badgeColor: 'primary',
          },
        ],
      },
      {
        id: 'system',
        label: 'System',
        items: [
          {
            to: '/showcase/settings',
            label: 'Settings',
            icon: '⚙️',
            requiredRoles: ['admin', 'editor'],
          },
          { to: '/example-app', label: 'Example App', icon: '📋' },
        ],
      },
    ],
  },

  breadcrumbs: [
    { pattern: '/dashboard', label: 'Dashboard', icon: '📊' },
    { pattern: '/showcase/tokens', label: 'Design Tokens', icon: '🎨' },
    { pattern: '/showcase/components', label: 'Components', icon: '🧩' },
    { pattern: '/showcase/data-overlay', label: 'Data & Overlay', icon: '📊' },
    { pattern: '/showcase/metadata', label: 'Metadata Engine', icon: '🏗️' },
    { pattern: '/showcase/crud', label: 'CRUD Engine', icon: '⚡' },
    { pattern: '/showcase/state', label: 'State Mgmt', icon: '🔄' },
    { pattern: '/showcase/relation', label: 'Relations', icon: '🔗' },
    { pattern: '/showcase/query-builder', label: 'Query Builder', icon: '🔍' },
    { pattern: '/showcase/generic-list', label: 'Generic List', icon: '📋' },
    { pattern: '/showcase/generic-form', label: 'Generic Form', icon: '📝' },
    { pattern: '/showcase/relation-nested-crud', label: 'Nested CRUD', icon: '🔗' },
    { pattern: '/showcase/settings', label: 'Settings', icon: '⚙️' },
    { pattern: '/showcase/config-preview', label: 'Config Preview', icon: '🔧' },
    { pattern: '/showcase/bieu-lai-suat', label: 'Biểu Lãi Suất', icon: '💹' },
    { pattern: '/showcase/command-palette', label: 'Command Palette', icon: '🎯' },
    { pattern: '/showcase/activity-log', label: 'Activity Log', icon: '📋' },
    { pattern: '/showcase/screen-permissions', label: 'Screen Permissions', icon: '🔐' },
    { pattern: '/example-app', label: 'Example App', icon: '📋' },
  ],
};
