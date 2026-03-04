// ============================================================
// Query Key Factory - Centralized, type-safe query keys
// Follows React Query best practice: structured key hierarchy
// Pattern: ['domain', 'scope', 'entity', ...params]
// ============================================================

import type { QueryOptions } from '../../types';

/**
 * All query keys are built from this factory.
 * This guarantees consistent key structures and makes
 * cache invalidation predictable.
 *
 * Usage:
 *   queryKeys.crud.list('default', 'users', options)
 *   queryKeys.crud.detail('default', 'users', 1)
 *   queryKeys.schema.entity('default', 'users')
 *   queryKeys.relation.options('default', 'users', 100)
 */
export const queryKeys = {
  // ─── CRUD ──────────────────────────────────────────────
  crud: {
    /** All crud queries (for broad invalidation) */
    all: () => ['crud'] as const,

    /** All queries for a specific connection + entity */
    entity: (connectionId: string, entity: string) => ['crud', connectionId, entity] as const,

    /** List query with full params */
    list: (connectionId: string, entity: string, opts?: QueryOptions) =>
      ['crud', connectionId, entity, 'list', opts] as const,

    /** Single item detail */
    detail: (connectionId: string, entity: string, id: string | number) =>
      ['crud', connectionId, entity, 'detail', id] as const,
  },

  // ─── Schema ────────────────────────────────────────────
  schema: {
    /** All schema queries */
    all: () => ['schema'] as const,

    /** All tables for a connection */
    tables: (connectionId: string) => ['schema', connectionId, 'tables'] as const,

    /** Single entity schema */
    entity: (connectionId: string, entity: string) => ['schema', connectionId, entity] as const,
  },

  // ─── Relation Options ──────────────────────────────────
  relation: {
    /** All relation option queries */
    all: () => ['relation-options'] as const,

    /** Options for a specific target entity */
    options: (connectionId: string, target: string, limit?: number) =>
      ['relation-options', connectionId, target, limit ?? 100] as const,

    /** Search results for relation */
    search: (connectionId: string, target: string, term: string) =>
      ['relation-options', connectionId, target, 'search', term] as const,
  },

  // ─── Auth / User ──────────────────────────────────────
  auth: {
    /** Current user profile */
    profile: () => ['auth', 'profile'] as const,
    /** Permissions */
    permissions: () => ['auth', 'permissions'] as const,
  },
} as const;

// ─── Helper Types ────────────────────────────────────────────

/** Extract the return type of a query key factory function */
export type QueryKeyOf<T extends (...args: never[]) => readonly unknown[]> = ReturnType<T>;
