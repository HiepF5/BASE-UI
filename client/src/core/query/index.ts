// ============================================================
// Query Module - Barrel Exports
// Centralizes React Query production setup
// ============================================================

// Query client
export { createQueryClient, appQueryClient } from './queryClient';

// Query key factory
export { queryKeys } from './queryKeys';
export type { QueryKeyOf } from './queryKeys';

// Optimistic update helpers
export {
  optimisticUpdate,
  optimisticDelete,
  optimisticBulkDelete,
  invalidateEntity,
  invalidateAllCrud,
  prefetchDetail,
} from './optimisticHelpers';
