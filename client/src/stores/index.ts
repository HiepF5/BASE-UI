// Re-export from auth module for backward compatibility
export { useAuthStore } from '../modules/auth';
export type { AuthUser } from '../modules/auth';
export { useTableStore } from './tableStore';
export { useUIStore } from './uiStore';
export type { Theme } from './uiStore';
export {
  useMetadataStore,
  selectSchema,
  selectSchemaLoading,
  selectLoadedEntities,
  selectSchemasCount,
} from './metadataStore';
export { withImmerDevtools, createSelector } from './middleware';
