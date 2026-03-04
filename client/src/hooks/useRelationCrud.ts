import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCrudService } from '../core/api/crudService';
import { queryKeys } from '../core/query';
import type { PaginatedResult } from '../types';

// ============================================================
// useRelationCrud – CRUD scoped to a child entity filtered by parent FK
// Used by RelationInlineTable for OneToMany inline editing
// Pattern: React Query for server state, auto FK injection
// ============================================================

export interface UseRelationCrudOptions {
  /** Parent entity's primary key value */
  parentId: string | number | null;
  /** Foreign key field on the child entity */
  foreignKey: string;
  /** Connection ID */
  connectionId?: string;
  /** Disable fetching */
  enabled?: boolean;
  /** Page size for inline table */
  limit?: number;
}

export interface UseRelationCrudReturn<T = Record<string, unknown>> {
  /** Child records */
  data: T[];
  /** Total count */
  total: number;
  /** Loading */
  isLoading: boolean;
  /** Fetching (background) */
  isFetching: boolean;
  /** Error */
  error: Error | null;
  /** Refetch children */
  refetch: () => void;

  /** Create a child record (auto-injects FK) */
  create: (data: Partial<T>) => Promise<T>;
  /** Update a child record */
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  /** Delete a child record */
  remove: (id: string | number) => Promise<void>;

  /** Mutation states */
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useRelationCrud<T = Record<string, unknown>>(
  childEntity: string,
  options: UseRelationCrudOptions,
): UseRelationCrudReturn<T> {
  const { parentId, foreignKey, connectionId = 'default', enabled = true, limit = 50 } = options;

  const queryClient = useQueryClient();
  const service = createCrudService<T>(connectionId, childEntity);

  // Query keys for this child entity scoped to parent
  const childBaseKey = useMemo(
    () => [...queryKeys.crud.entity(connectionId, childEntity), 'relation', parentId],
    [connectionId, childEntity, parentId],
  );

  const childListKey = useMemo(() => [...childBaseKey, 'list', { limit }], [childBaseKey, limit]);

  // ─── Fetch child records filtered by parent FK ──────────
  const listQuery = useQuery<PaginatedResult<T>>({
    queryKey: childListKey,
    queryFn: () =>
      service.list({
        limit,
        filter: {
          logic: 'AND',
          conditions: [{ field: foreignKey, operator: 'eq', value: parentId }],
        },
      }),
    staleTime: 30_000,
    enabled: enabled && Boolean(parentId) && Boolean(childEntity),
  });

  // ─── Create (auto-inject FK) ───────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: Partial<T>) =>
      service.create({
        ...data,
        [foreignKey]: parentId,
      } as Partial<T>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childBaseKey });
    },
  });

  // ─── Update ─────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<T> }) =>
      service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childBaseKey });
    },
  });

  // ─── Delete ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childBaseKey });
    },
  });

  // Wrap mutateAsync with simpler signatures
  const create = useCallback(
    (data: Partial<T>) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const update = useCallback(
    (id: string | number, data: Partial<T>) => updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const remove = useCallback(
    (id: string | number) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  return {
    data: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error as Error | null,
    refetch: () => listQuery.refetch(),

    create,
    update,
    remove,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
