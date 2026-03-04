import { useEffect, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { apiClient } from '../core/api/apiClient';
import { schemaRegistry } from '../config/schema.config';
import { tableSchemaToEntitySchema } from '../core/metadata/field-mapping';
import { useMetadataStore } from '../stores/metadataStore';
import { queryKeys } from '../core/query';
import type { EntitySchema, FieldSchema } from '../core/metadata/schema.types';
import type { TableSchema } from '../types';

// ============================================================
// useEntitySchema - Metadata Engine hook
// Merge strategy: static config (schemaRegistry) > auto-generated (API)
// Priority: hard-coded field overrides từ config, fallback auto-gen từ DB
// Integration: caches resolved schema into MetadataStore (Zustand)
// ============================================================

interface UseEntitySchemaOptions {
  /** Disable auto-fetch from API (use only static config) */
  staticOnly?: boolean;
}

interface UseEntitySchemaResult {
  /** Merged EntitySchema (config + API) */
  schema: EntitySchema | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether using static config (true) or auto-generated (false) */
  isStatic: boolean;
}

export function useEntitySchema(
  connectionId: string,
  entity: string,
  options?: UseEntitySchemaOptions,
): UseEntitySchemaResult {
  const metadataStore = useMetadataStore();

  // 1. Check static config first
  const staticSchema = schemaRegistry[entity] || null;

  // 2. Check metadata store cache (for previously resolved API schemas)
  const cachedSchema = metadataStore.getSchema(entity);

  // 3. Fetch from API only if no static config AND not cached
  const shouldFetch = !options?.staticOnly && !staticSchema && !cachedSchema;

  const {
    data: apiTableSchema,
    isLoading,
    error,
  } = useQuery<TableSchema>({
    queryKey: queryKeys.schema.entity(connectionId, entity),
    queryFn: () => apiClient.get(`/schema/${connectionId}/${entity}`),
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetch && !!entity,
  });

  // 3. Merge: static config wins, cache next, API fills gaps
  const schema = useMemo(() => {
    // If we have static config, use it directly
    if (staticSchema) return staticSchema;

    // If cached in metadata store, use that
    if (cachedSchema) return cachedSchema;

    // If API schema available, convert
    if (apiTableSchema) {
      return tableSchemaToEntitySchema(apiTableSchema);
    }

    return null;
  }, [staticSchema, cachedSchema, apiTableSchema]);

  // 4. Cache the resolved schema in MetadataStore
  useEffect(() => {
    if (schema && entity && !metadataStore.hasSchema(entity)) {
      metadataStore.setSchema(entity, schema);
    }
  }, [schema, entity]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    schema,
    isLoading: shouldFetch ? isLoading : false,
    error: error as Error | null,
    isStatic: !!staticSchema,
  };
}

// ─── useRelationOptions - Load options for relation fields ────

interface UseRelationOptionsResult {
  /** { fieldName: options[] } */
  optionsMap: Record<string, Array<{ label: string; value: string | number }>>;
  /** { fieldName: boolean } */
  loadingMap: Record<string, boolean>;
}

export function useRelationOptions(
  connectionId: string,
  fields: FieldSchema[],
): UseRelationOptionsResult {
  // Find all ManyToOne / OneToOne / ManyToMany relation fields
  const relationFields = useMemo(
    () =>
      fields.filter(
        (f) =>
          f.type === 'relation' &&
          f.relation &&
          (f.relation.type === 'ManyToOne' ||
            f.relation.type === 'OneToOne' ||
            f.relation.type === 'ManyToMany'),
      ),
    [fields],
  );

  // Use useQueries (plural) – avoids calling hooks in loops
  const queries = useQueries({
    queries: relationFields.map((field) => {
      const rel = field.relation!;
      const limit = rel.preloadLimit || 100;
      return {
        queryKey: queryKeys.relation.options(connectionId, rel.target, limit),
        queryFn: () =>
          apiClient.get<Record<string, unknown>[]>(
            `/crud/${connectionId}/${rel.target}?limit=${limit}`,
          ),
        staleTime: 2 * 60 * 1000,
        enabled: !!connectionId,
      };
    }),
  });

  const result = useMemo(() => {
    const optionsMap: Record<string, Array<{ label: string; value: string | number }>> = {};
    const loadingMap: Record<string, boolean> = {};

    relationFields.forEach((field, idx) => {
      const query = queries[idx];
      const rel = field.relation!;
      loadingMap[field.name] = query.isLoading;

      if (query.data) {
        const items = Array.isArray(query.data) ? query.data : [];
        optionsMap[field.name] = items.map((item: Record<string, unknown>) => ({
          label: String(item[rel.displayField] || item.name || item.id),
          value: item.id as string | number,
        }));
      } else {
        optionsMap[field.name] = [];
      }
    });

    return { optionsMap, loadingMap };
  }, [relationFields, queries]);

  return result;
}
