import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/core/api/apiClient';
import { buildQueryString } from '@/core/utils';
import { useTableStore } from '@/stores';
import type { PaginatedResult, QueryOptions } from '@/types';

/**
 * useCrud — generic CRUD hook driven by entity name.
 *
 * Provides:
 *  - listQuery   → paginated, filtered, sorted
 *  - getOneQuery → single record
 *  - createMutation
 *  - updateMutation
 *  - deleteMutation
 *  - bulkDeleteMutation
 */

interface UseCrudOptions {
  entity: string;
  /** Additional include relations */
  include?: string[];
  /** Custom base URL override */
  baseUrl?: string;
  /** Disable auto-refetch on focus */
  enabled?: boolean;
}

export function useCrud<T = any>({ entity, include, baseUrl, enabled = true }: UseCrudOptions) {
  const qc = useQueryClient();
  const buildQuery = useTableStore((s) => s.buildQuery);

  const url = baseUrl ?? `/crud/${entity}`;
  const queryKey = [entity, 'list'];

  /* ── LIST ── */
  const listQuery = useQuery<PaginatedResult<T>>({
    queryKey: [...queryKey, buildQuery(entity)],
    queryFn: async () => {
      const opts: QueryOptions = { ...buildQuery(entity) };
      if (include?.length) opts.include = include;
      const qs = buildQueryString(opts);
      return apiClient.get(`${url}?${qs}`);
    },
    enabled,
    placeholderData: (prev) => prev,   // keep previous page visible while fetching next
  });

  /* ── GET ONE ── */
  const getOneQuery = (id: string | number | undefined) =>
    useQuery<T>({
      queryKey: [entity, 'detail', id],
      queryFn: () => apiClient.get(`${url}/${id}`),
      enabled: !!id,
    });

  /* ── CREATE ── */
  const createMutation = useMutation({
    mutationFn: (data: Partial<T>) => apiClient.post<T>(url, data),
    onSuccess: () => {
      toast.success('Tạo thành công');
      qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => toast.error(err.message ?? 'Lỗi khi tạo'),
  });

  /* ── UPDATE ── */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<T> }) =>
      apiClient.put<T>(`${url}/${id}`, data),
    onSuccess: () => {
      toast.success('Cập nhật thành công');
      qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => toast.error(err.message ?? 'Lỗi khi cập nhật'),
  });

  /* ── DELETE ── */
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => apiClient.delete(`${url}/${id}`),
    onSuccess: () => {
      toast.success('Xóa thành công');
      qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => toast.error(err.message ?? 'Lỗi khi xóa'),
  });

  /* ── BULK DELETE ── */
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => apiClient.post(`${url}/bulk-delete`, { ids }),
    onSuccess: () => {
      toast.success('Xóa hàng loạt thành công');
      qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => toast.error(err.message ?? 'Lỗi khi xóa hàng loạt'),
  });

  return {
    listQuery,
    getOneQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
  };
}
