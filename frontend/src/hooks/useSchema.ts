import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { TableSchema } from '@/types';

/**
 * useSchema — Fetch table schema (columns + relations) for a given entity.
 * Used by DynamicCrudPage to build form & table dynamically.
 */
export function useSchema(tableName: string | undefined) {
  return useQuery<TableSchema>({
    queryKey: ['schema', tableName],
    queryFn: () => apiClient.get(`/schema/${tableName}/columns`),
    enabled: !!tableName,
    staleTime: 5 * 60_000, // schema rarely changes
  });
}

/**
 * useTableList — Fetch all table names for the current connection.
 */
export function useTableList() {
  return useQuery<string[]>({
    queryKey: ['schema', 'tables'],
    queryFn: () => apiClient.get('/schema/tables'),
    staleTime: 5 * 60_000,
  });
}

/**
 * useRelations — Fetch relations for a specific table.
 */
export function useRelations(tableName: string | undefined) {
  return useQuery({
    queryKey: ['schema', tableName, 'relations'],
    queryFn: () => apiClient.get(`/schema/${tableName}/relations`),
    enabled: !!tableName,
    staleTime: 5 * 60_000,
  });
}
