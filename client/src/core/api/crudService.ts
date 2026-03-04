import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './apiClient';
import type { PaginatedResult, QueryOptions, FilterGroup, SortOption } from '../../types';
import { buildQueryString } from '../utils';

// ============================================================
// CrudService - Typed CRUD operations layer
// Sits on top of apiClient, provides entity-scoped CRUD API
// Follows RESTful conventions from api_design.md
// ============================================================

/** Response envelope from the API */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode?: number;
}

/** Error shape from API */
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp?: string;
}

/** Build a CRUD service scoped to a connection + entity */
export function createCrudService<T = Record<string, unknown>>(
  connectionId: string,
  entity: string,
) {
  const basePath = `/crud/${connectionId}/${entity}`;

  return {
    /** GET /crud/:connectionId/:entity?page=&limit=&sort=&filter=&search=&include= */
    async list(options?: QueryOptions): Promise<PaginatedResult<T>> {
      const qs = options
        ? buildQueryString({
            page: options.page,
            limit: options.limit,
            sort: options.sort ? formatSort(options.sort) : undefined,
            filter: options.filter ? JSON.stringify(options.filter) : undefined,
            search: options.search,
            include: options.include?.join(','),
          })
        : '';
      return apiClient.get<PaginatedResult<T>>(`${basePath}${qs ? `?${qs}` : ''}`);
    },

    /** GET /crud/:connectionId/:entity/:id */
    async getOne(id: string | number, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.get<T>(`${basePath}/${id}`, config);
    },

    /** POST /crud/:connectionId/:entity */
    async create(data: Partial<T>): Promise<T> {
      return apiClient.post<T>(basePath, data);
    },

    /** PUT /crud/:connectionId/:entity/:id */
    async update(id: string | number, data: Partial<T>): Promise<T> {
      return apiClient.put<T>(`${basePath}/${id}`, data);
    },

    /** PATCH /crud/:connectionId/:entity/:id */
    async patch(id: string | number, data: Partial<T>): Promise<T> {
      return apiClient.patch<T>(`${basePath}/${id}`, data);
    },

    /** DELETE /crud/:connectionId/:entity/:id */
    async remove(id: string | number): Promise<void> {
      return apiClient.delete(`${basePath}/${id}`);
    },

    /** POST /crud/:connectionId/:entity/bulk-delete */
    async bulkDelete(ids: Array<string | number>): Promise<void> {
      return apiClient.post(`${basePath}/bulk-delete`, { ids });
    },
  };
}

/** Format SortOption[] to string: "field:direction,field:direction" */
function formatSort(sort: SortOption[]): string | undefined {
  if (!sort.length) return undefined;
  return sort.map((s) => `${s.field}:${s.direction}`).join(',');
}

// ─── Relation helpers ──────────────────────────────────────
/** Load relation options for a target entity */
export async function loadRelationOptions(
  connectionId: string,
  targetEntity: string,
  displayField: string,
  limit = 100,
): Promise<Array<{ label: string; value: string | number }>> {
  const result = await apiClient.get<PaginatedResult<Record<string, unknown>>>(
    `/crud/${connectionId}/${targetEntity}?limit=${limit}`,
  );
  const items = result?.data ?? (Array.isArray(result) ? result : []);
  return items.map((item) => ({
    label: String(item[displayField] || item.name || item.id || ''),
    value: (item.id as string | number) ?? '',
  }));
}

/** Search relation options with a query */
export async function searchRelationOptions(
  connectionId: string,
  targetEntity: string,
  displayField: string,
  searchTerm: string,
  limit = 20,
): Promise<Array<{ label: string; value: string | number }>> {
  const filter: FilterGroup = {
    logic: 'OR',
    conditions: [{ field: displayField, operator: 'like', value: searchTerm }],
  };
  const result = await apiClient.get<PaginatedResult<Record<string, unknown>>>(
    `/crud/${connectionId}/${targetEntity}?limit=${limit}&filter=${JSON.stringify(filter)}`,
  );
  const items = result?.data ?? (Array.isArray(result) ? result : []);
  return items.map((item) => ({
    label: String(item[displayField] || item.name || item.id || ''),
    value: (item.id as string | number) ?? '',
  }));
}

/** Type for the CRUD service returned by createCrudService */
export type CrudService<T = Record<string, unknown>> = ReturnType<typeof createCrudService<T>>;
