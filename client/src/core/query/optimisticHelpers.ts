// ============================================================
// Optimistic Helpers - Reusable optimistic update utilities
// Extracts the optimistic update pattern from useCrud into
// composable factory functions.
// Pattern: snapshot → optimistic set → rollback on error → invalidate
// ============================================================

import type { QueryClient } from '@tanstack/react-query';
import type { PaginatedResult } from '../../types';

// ─── Types ───────────────────────────────────────────────────

interface OptimisticContext<T> {
  previousData: PaginatedResult<T> | undefined;
}

type ItemWithId = Record<string, unknown> & { id?: string | number };

// ─── Optimistic Update for UPDATE ────────────────────────────

/**
 * Create mutation options for optimistic update.
 * Immediately patches the matching item in the list cache,
 * rolls back on error, and invalidates on settle.
 */
export function optimisticUpdate<T>(
  queryClient: QueryClient,
  listKey: readonly unknown[],
  baseKey: readonly unknown[],
) {
  return {
    onMutate: async ({ id, data }: { id: string | number; data: Partial<T> }) => {
      // Cancel in-flight queries to prevent overwrite
      await queryClient.cancelQueries({ queryKey: [...baseKey] });

      // Snapshot current data
      const previousData = queryClient.getQueryData<PaginatedResult<T>>([...listKey]);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<PaginatedResult<T>>([...listKey], {
          ...previousData,
          data: previousData.data.map((item) =>
            (item as ItemWithId).id === id ? { ...item, ...data } : item,
          ) as T[],
        });
      }

      return { previousData } as OptimisticContext<T>;
    },

    onError: (_err: unknown, _vars: unknown, context: OptimisticContext<T> | undefined) => {
      if (context?.previousData) {
        queryClient.setQueryData([...listKey], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...baseKey] });
    },
  };
}

// ─── Optimistic Delete (single) ─────────────────────────────

/**
 * Create mutation options for optimistic single-item delete.
 * Immediately removes item from the list cache.
 */
export function optimisticDelete<T>(
  queryClient: QueryClient,
  listKey: readonly unknown[],
  baseKey: readonly unknown[],
) {
  return {
    onMutate: async (id: string | number) => {
      await queryClient.cancelQueries({ queryKey: [...baseKey] });

      const previousData = queryClient.getQueryData<PaginatedResult<T>>([...listKey]);

      if (previousData) {
        queryClient.setQueryData<PaginatedResult<T>>([...listKey], {
          ...previousData,
          data: previousData.data.filter((item) => (item as ItemWithId).id !== id),
          total: previousData.total - 1,
        });
      }

      return { previousData } as OptimisticContext<T>;
    },

    onError: (_err: unknown, _id: unknown, context: OptimisticContext<T> | undefined) => {
      if (context?.previousData) {
        queryClient.setQueryData([...listKey], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...baseKey] });
    },
  };
}

// ─── Optimistic Bulk Delete ─────────────────────────────────

/**
 * Create mutation options for optimistic bulk delete.
 * Removes all matching items from the list cache.
 */
export function optimisticBulkDelete<T>(
  queryClient: QueryClient,
  listKey: readonly unknown[],
  baseKey: readonly unknown[],
) {
  return {
    onMutate: async (ids: Array<string | number>) => {
      await queryClient.cancelQueries({ queryKey: [...baseKey] });

      const previousData = queryClient.getQueryData<PaginatedResult<T>>([...listKey]);

      if (previousData) {
        const idSet = new Set(ids.map(String));
        queryClient.setQueryData<PaginatedResult<T>>([...listKey], {
          ...previousData,
          data: previousData.data.filter((item) => !idSet.has(String((item as ItemWithId).id))),
          total: previousData.total - ids.length,
        });
      }

      return { previousData } as OptimisticContext<T>;
    },

    onError: (_err: unknown, _ids: unknown, context: OptimisticContext<T> | undefined) => {
      if (context?.previousData) {
        queryClient.setQueryData([...listKey], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...baseKey] });
    },
  };
}

// ─── Invalidation Helpers ───────────────────────────────────

/** Invalidate all queries for a specific entity */
export function invalidateEntity(queryClient: QueryClient, connectionId: string, entity: string) {
  return queryClient.invalidateQueries({
    queryKey: ['crud', connectionId, entity],
  });
}

/** Invalidate all CRUD queries */
export function invalidateAllCrud(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['crud'] });
}

/** Prefetch a single entity detail */
export async function prefetchDetail<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
) {
  await queryClient.prefetchQuery({
    queryKey: [...queryKey],
    queryFn,
    staleTime: 30_000,
  });
}
