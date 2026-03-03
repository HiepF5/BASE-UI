import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../core/api/apiClient';
import type { TableSchema } from '../types';

// ============================================================
// useSchema - Fetch table schema from backend
// ============================================================
export function useSchema(connectionId: string, entity: string) {
  return useQuery<TableSchema>({
    queryKey: ['schema', connectionId, entity],
    queryFn: () => apiClient.get(`/schema/${connectionId}/${entity}`),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useTables(connectionId: string) {
  return useQuery<string[]>({
    queryKey: ['tables', connectionId],
    queryFn: () => apiClient.get(`/schema/${connectionId}/tables`),
    staleTime: 5 * 60 * 1000,
  });
}
