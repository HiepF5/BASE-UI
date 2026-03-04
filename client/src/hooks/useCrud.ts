import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCrudService } from '../core/api/crudService';
import { queryKeys, optimisticUpdate, optimisticDelete, optimisticBulkDelete } from '../core/query';
import type { PaginatedResult, QueryOptions } from '../types';

// ============================================================
// useCrud - Generic CRUD hook (React Query)
// Production: centralized query keys, reusable optimistic helpers,
//   typed service, proper error typing.
// Follows State Management rules: React Query for server state
// ============================================================

/** CRUD hook options */
interface UseCrudOptions extends QueryOptions {
  /** Disable auto-fetching the list */
  enabled?: boolean;
  /** Override default stale time (ms) */
  staleTime?: number;
}

/** CRUD hook return type */
export interface UseCrudReturn<T> {
  // ─── List ───────────────
  data: T[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  // ─── Single ─────────────
  getOne: (id: string | number) => Promise<T>;
  // ─── Mutations ──────────
  create: (data: Partial<T>) => Promise<T>;
  update: (params: { id: string | number; data: Partial<T> }) => Promise<T>;
  remove: (id: string | number) => Promise<void>;
  bulkDelete: (ids: Array<string | number>) => Promise<void>;
  // ─── Mutation States ────
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBulkDeleting: boolean;
  // ─── Mutation Errors ────
  createError: Error | null;
  updateError: Error | null;
  deleteError: Error | null;
  // ─── Reset mutation states ──
  resetCreate: () => void;
  resetUpdate: () => void;
  resetDelete: () => void;
}

export function useCrud<T = Record<string, unknown>>(
  connectionId: string,
  entity: string,
  options?: UseCrudOptions,
): UseCrudReturn<T> {
  const queryClient = useQueryClient();
  const service = createCrudService<T>(connectionId, entity);

  // ─── Query keys (via factory) ───────────────────────────
  const listKey = queryKeys.crud.list(connectionId, entity, options);
  const baseKey = queryKeys.crud.entity(connectionId, entity);

  // ─── List query ─────────────────────────────────────────
  const listQuery = useQuery<PaginatedResult<T>>({
    queryKey: listKey,
    queryFn: () =>
      service.list({
        page: options?.page,
        limit: options?.limit,
        sort: options?.sort,
        filter: options?.filter,
        search: options?.search,
        include: options?.include,
      }),
    staleTime: options?.staleTime ?? 30_000,
    enabled: options?.enabled !== false && Boolean(entity),
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });

  // ─── Get one (imperative) ───────────────────────────────
  const getOne = (id: string | number) => service.getOne(id);

  // ─── Create mutation ────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: Partial<T>) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...baseKey] });
    },
  });

  // ─── Update mutation (optimistic) ──────────────────────
  const updateOptimistic = optimisticUpdate<T>(queryClient, listKey, baseKey);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<T> }) =>
      service.update(id, data),
    ...updateOptimistic,
  });

  // ─── Delete mutation (optimistic) ──────────────────────
  const deleteOptimistic = optimisticDelete<T>(queryClient, listKey, baseKey);

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => service.remove(id),
    ...deleteOptimistic,
  });

  // ─── Bulk delete mutation (optimistic) ─────────────────
  const bulkDeleteOptimistic = optimisticBulkDelete<T>(queryClient, listKey, baseKey);

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: Array<string | number>) => service.bulkDelete(ids),
    ...bulkDeleteOptimistic,
  });

  return {
    // List
    data: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error as Error | null,
    refetch: () => {
      listQuery.refetch();
    },
    // Single
    getOne,
    // Mutations
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    // Mutation errors
    createError: createMutation.error as Error | null,
    updateError: updateMutation.error as Error | null,
    deleteError: deleteMutation.error as Error | null,
    // Reset
    resetCreate: createMutation.reset,
    resetUpdate: updateMutation.reset,
    resetDelete: deleteMutation.reset,
  };
}
