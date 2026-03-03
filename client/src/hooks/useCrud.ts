import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../core/api/apiClient';
import type { PaginatedResult, QueryOptions } from '../types';
import { buildQueryString } from '../core/utils';

// ============================================================
// useCrud - Generic CRUD hook (React Query)
// ============================================================
export function useCrud<T = any>(connectionId: string, entity: string, options?: QueryOptions) {
  const queryClient = useQueryClient();
  const queryKey = ['crud', connectionId, entity, options];

  const qs = options ? buildQueryString({
    page: options.page,
    limit: options.limit,
    sort: options.sort,
    filter: options.filter,
    search: options.search,
    include: options.include,
  }) : '';

  const listQuery = useQuery<PaginatedResult<T>>({
    queryKey,
    queryFn: () =>
      apiClient.get(`/crud/${connectionId}/${entity}${qs ? `?${qs}` : ''}`),
  });

  const getOne = (id: string) =>
    apiClient.get<T>(`/crud/${connectionId}/${entity}/${id}`);

  const createMutation = useMutation({
    mutationFn: (data: Partial<T>) =>
      apiClient.post(`/crud/${connectionId}/${entity}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
      apiClient.put(`/crud/${connectionId}/${entity}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/crud/${connectionId}/${entity}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.post(`/crud/${connectionId}/${entity}/bulk-delete`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  return {
    // List
    data: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Single
    getOne,
    // Mutations
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
