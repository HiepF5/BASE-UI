// ============================================================
// Lazy Import Utility – Code Splitting Helper
// Phase 5 – Performance: Code splitting
// Wraps React.lazy with named export resolution + preload support
// ============================================================

import { lazy, type ComponentType } from 'react';

/**
 * Lazy import a named export from a module.
 * Automatically wraps in React.lazy with the correct default export shape.
 *
 * @example
 * const DashboardPage = lazyImport(() => import('./modules/dashboard'), 'DashboardPage');
 * const ExampleApp = lazyImport(() => import('./modules/example-app'));
 */
export function lazyImport<T extends Record<string, unknown>, K extends keyof T>(
  factory: () => Promise<T>,
  name?: K,
): React.LazyExoticComponent<ComponentType<unknown>> {
  return lazy(async () => {
    const module = await factory();
    if (name) {
      return { default: module[name] as unknown as ComponentType<unknown> };
    }
    // If no name, assume the module has a default export
    return module as unknown as { default: ComponentType<unknown> };
  });
}

/**
 * Preload a module (trigger import without rendering).
 * Useful for hover-based prefetching on navigation links.
 *
 * @example
 * <NavLink onMouseEnter={() => preloadModule(() => import('./modules/dashboard'))}>
 */
export function preloadModule(factory: () => Promise<unknown>): void {
  factory().catch(() => {
    // Silently ignore — module will be loaded when needed
  });
}

/**
 * Map of preloadable route modules.
 * Key = route path prefix, Value = factory function.
 * Used by AdminLayout to preload on hover.
 */
export const routeModules: Record<string, () => Promise<unknown>> = {
  dashboard: () => import('../../modules/dashboard/DashboardPage'),
  connections: () => import('../../modules/connections/ConnectionsPage'),
  ai: () => import('../../modules/ai-chat/AiChatPanel'),
  'example-app': () => import('../../modules/example-app/ExampleAppPage'),
  'showcase/tokens': () => import('../../modules/showcase/TokenShowcasePage'),
  'showcase/components': () => import('../../modules/showcase/ComponentShowcasePage'),
  'showcase/metadata': () => import('../../modules/showcase/MetadataShowcasePage'),
  'showcase/crud': () => import('../../modules/showcase/CrudShowcasePage'),
  'showcase/state': () => import('../../modules/showcase/StateShowcasePage'),
  'showcase/relation': () => import('../../modules/showcase/RelationShowcasePage'),
  'showcase/query-builder': () => import('../../modules/showcase/QueryBuilderShowcasePage'),
};
