import { useCallback, useMemo, useRef } from 'react';
import { apiClient } from '../core/api/apiClient';
import { createCrudService } from '../core/api/crudService';
import type { EntitySchema, FieldSchema } from '../core/metadata/schema.types';
import { getInlineTableRelationFields } from '../core/metadata';

// ============================================================
// useNestedCrud – Nested transaction support
// Collects parent + OneToMany children data and submits as one payload.
// Server-side: expects nested save (transaction) or falls back to
//   sequential create (parent → children).
// Pattern: Nested CRUD per Relation_nested_CRUD.md rules
// ============================================================

/** Pending child operation */
export interface ChildOperation<T = Record<string, unknown>> {
  type: 'create' | 'update' | 'delete';
  entity: string;
  foreignKey: string;
  data?: Partial<T>;
  id?: string | number;
}

export interface UseNestedCrudOptions {
  /** Parent entity schema */
  schema: EntitySchema | null;
  /** Connection ID */
  connectionId?: string;
}

export interface NestedPayload {
  /** Parent data */
  data: Record<string, unknown>;
  /** Nested children keyed by relation field name */
  children: Record<string, Record<string, unknown>[]>;
}

export interface UseNestedCrudReturn {
  /**
   * Save parent + all nested children in one call.
   * If server supports nested save → single POST.
   * Fallback → sequential creates.
   */
  nestedCreate: (payload: NestedPayload) => Promise<Record<string, unknown>>;

  /**
   * Update parent and apply child operations (create/update/delete).
   */
  nestedUpdate: (
    parentId: string | number,
    parentData: Record<string, unknown>,
    childOps: ChildOperation[],
  ) => Promise<Record<string, unknown>>;

  /** Get OneToMany relation fields from schema */
  oneToManyFields: FieldSchema[];

  /**
   * Build the nested payload structure expected by the server.
   * parentData + children[] = nested save request.
   */
  buildNestedPayload: (
    parentData: Record<string, unknown>,
    childrenMap: Record<string, Record<string, unknown>[]>,
  ) => NestedPayload;
}

export function useNestedCrud(options: UseNestedCrudOptions): UseNestedCrudReturn {
  const { schema, connectionId = 'default' } = options;

  // One-to-many relation fields
  const oneToManyFields = useMemo(() => {
    if (!schema) return [];
    return getInlineTableRelationFields(schema.fields);
  }, [schema]);

  // Ref to avoid stale closure
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  // Build nested payload
  const buildNestedPayload = useCallback(
    (
      parentData: Record<string, unknown>,
      childrenMap: Record<string, Record<string, unknown>[]>,
    ): NestedPayload => ({
      data: parentData,
      children: childrenMap,
    }),
    [],
  );

  /**
   * Sequential fallback: create parent, then children
   */
  const sequentialCreate = useCallback(
    async (entity: string, payload: NestedPayload): Promise<Record<string, unknown>> => {
      // 1. Create parent
      const parentService = createCrudService(connectionId, entity);
      const parent = await parentService.create(payload.data);
      const parentPk = schemaRef.current?.primaryKey || 'id';
      const parentId = (parent as Record<string, unknown>)[parentPk];

      // 2. Create children
      for (const [fieldName, rows] of Object.entries(payload.children)) {
        if (!rows.length) continue;

        // Find the relation field to get target entity + FK
        const relField = oneToManyFields.find((f) => f.name === fieldName);
        if (!relField?.relation) continue;

        const childService = createCrudService(connectionId, relField.relation.target);
        const fk = relField.relation.foreignKey || `${entity}_id`;

        // Create all children with FK pointing to parent
        await Promise.all(rows.map((row) => childService.create({ ...row, [fk]: parentId })));
      }

      return parent as Record<string, unknown>;
    },
    [connectionId, oneToManyFields],
  );

  /**
   * Nested Create:
   * 1. Try POST /crud/:conn/:entity/nested with full payload
   * 2. Fallback: POST parent → map children with FK → POST each child
   */
  const nestedCreate = useCallback(
    async (payload: NestedPayload): Promise<Record<string, unknown>> => {
      const entity = schemaRef.current?.name;
      if (!entity) throw new Error('No schema available for nested create');

      const basePath = `/crud/${connectionId}/${entity}`;

      // Check if children exist
      const hasChildren = Object.values(payload.children).some((arr) => arr.length > 0);

      if (!hasChildren) {
        // Simple create — no children
        return apiClient.post<Record<string, unknown>>(basePath, payload.data);
      }

      // Try nested save endpoint first
      try {
        const result = await apiClient.post<Record<string, unknown>>(`${basePath}/nested`, payload);
        return result;
      } catch {
        // Fallback: sequential save
        return sequentialCreate(entity, payload);
      }
    },
    [connectionId, sequentialCreate],
  );

  /**
   * Nested Update: update parent + apply child operations
   */
  const nestedUpdate = useCallback(
    async (
      parentId: string | number,
      parentData: Record<string, unknown>,
      childOps: ChildOperation[],
    ): Promise<Record<string, unknown>> => {
      const entity = schemaRef.current?.name;
      if (!entity) throw new Error('No schema available for nested update');

      // 1. Update parent
      const parentService = createCrudService(connectionId, entity);
      const parent = await parentService.update(parentId, parentData);

      // 2. Apply child operations
      const opPromises = childOps.map((op) => {
        const childService = createCrudService(connectionId, op.entity);

        switch (op.type) {
          case 'create':
            return childService.create({
              ...op.data,
              [op.foreignKey]: parentId,
            });
          case 'update':
            if (!op.id) throw new Error('Child update requires id');
            return childService.update(op.id, op.data ?? {});
          case 'delete':
            if (!op.id) throw new Error('Child delete requires id');
            return childService.remove(op.id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(opPromises);

      return parent as Record<string, unknown>;
    },
    [connectionId],
  );

  return {
    nestedCreate,
    nestedUpdate,
    oneToManyFields,
    buildNestedPayload,
  };
}
