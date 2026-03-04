import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { EntitySchema } from '../core/metadata/schema.types';

// ============================================================
// Metadata Store - Global cache for EntitySchema objects
// Prevents redundant API calls when navigating between entities.
// Pattern: Zustand for global app state (STATE_STRATEGY.md)
// Production: immer + devtools, typed selectors
// ============================================================

interface MetadataState {
  /** Cached schemas: { [entityName]: EntitySchema } */
  schemas: Record<string, EntitySchema>;
  /** Track which schemas are currently loading */
  loading: Record<string, boolean>;
  /** Track errors per entity */
  errors: Record<string, string | null>;
  /** Last refresh timestamp per entity */
  lastUpdated: Record<string, number>;

  // ─── Actions ────────────
  /** Set (cache) a resolved schema */
  setSchema: (entity: string, schema: EntitySchema) => void;
  /** Mark a schema as loading */
  setLoading: (entity: string, loading: boolean) => void;
  /** Set error for an entity */
  setError: (entity: string, error: string | null) => void;
  /** Get a cached schema (or null) */
  getSchema: (entity: string) => EntitySchema | null;
  /** Check if schema is cached */
  hasSchema: (entity: string) => boolean;
  /** Check if schema is stale (older than maxAge ms, default 5min) */
  isStale: (entity: string, maxAge?: number) => boolean;
  /** Remove a cached schema */
  removeSchema: (entity: string) => void;
  /** Bulk set multiple schemas (e.g. from static registry) */
  setSchemas: (schemas: Record<string, EntitySchema>) => void;
  /** Clear all cached schemas */
  clear: () => void;
}

/** Default stale time: 5 minutes */
const DEFAULT_MAX_AGE = 5 * 60 * 1000;

export const useMetadataStore = create<MetadataState>()(
  devtools(
    immer((set, get) => ({
      schemas: {},
      loading: {},
      errors: {},
      lastUpdated: {},

      setSchema: (entity, schema) => {
        set(
          (state) => {
            state.schemas[entity] = schema;
            state.loading[entity] = false;
            state.errors[entity] = null;
            state.lastUpdated[entity] = Date.now();
          },
          false,
          'setSchema',
        );
      },

      setLoading: (entity, loading) => {
        set(
          (state) => {
            state.loading[entity] = loading;
          },
          false,
          'setLoading',
        );
      },

      setError: (entity, error) => {
        set(
          (state) => {
            state.errors[entity] = error;
            state.loading[entity] = false;
          },
          false,
          'setError',
        );
      },

      getSchema: (entity) => {
        return get().schemas[entity] ?? null;
      },

      hasSchema: (entity) => {
        return entity in get().schemas;
      },

      isStale: (entity, maxAge = DEFAULT_MAX_AGE) => {
        const ts = get().lastUpdated[entity];
        if (!ts) return true;
        return Date.now() - ts > maxAge;
      },

      removeSchema: (entity) => {
        set(
          (state) => {
            delete state.schemas[entity];
            delete state.loading[entity];
            delete state.errors[entity];
            delete state.lastUpdated[entity];
          },
          false,
          'removeSchema',
        );
      },

      setSchemas: (schemas) => {
        set(
          (state) => {
            const now = Date.now();
            for (const [entity, schema] of Object.entries(schemas)) {
              state.schemas[entity] = schema;
              state.loading[entity] = false;
              state.errors[entity] = null;
              state.lastUpdated[entity] = now;
            }
          },
          false,
          'setSchemas',
        );
      },

      clear: () => {
        set(
          (state) => {
            state.schemas = {};
            state.loading = {};
            state.errors = {};
            state.lastUpdated = {};
          },
          false,
          'clear',
        );
      },
    })),
    {
      name: 'MetadataStore',
      enabled: import.meta.env.DEV,
    },
  ),
);

// ─── Typed Selectors ─────────────────────────────────────────

/** Select a specific entity schema */
export const selectSchema = (entity: string) => (state: MetadataState) =>
  state.schemas[entity] ?? null;

/** Select whether an entity schema is loading */
export const selectSchemaLoading = (entity: string) => (state: MetadataState) =>
  state.loading[entity] ?? false;

/** Select all loaded entity names */
export const selectLoadedEntities = (state: MetadataState) => Object.keys(state.schemas);

/** Select total cached schemas count */
export const selectSchemasCount = (state: MetadataState) => Object.keys(state.schemas).length;
