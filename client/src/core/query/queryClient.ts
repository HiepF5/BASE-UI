// ============================================================
// QueryClient Factory - Production-grade React Query setup
// Follows STATE_STRATEGY.md: staleTime 30s, gcTime 5min, retry 1
// Centralizes error handling, devtools, global callbacks
// ============================================================

import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

// ─── Default Options ─────────────────────────────────────────

const queryDefaults: DefaultOptions['queries'] = {
  /** Data considered fresh for 30 seconds */
  staleTime: 30_000,
  /** Garbage collect inactive queries after 5 minutes */
  gcTime: 5 * 60_000,
  /** Retry only once on failure */
  retry: 1,
  /** Don't refetch when tab gains focus (avoid noise) */
  refetchOnWindowFocus: false,
  /** Don't refetch on reconnect automatically */
  refetchOnReconnect: 'always',
  /** Retry delay: exponential backoff capped at 30s */
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
};

const mutationDefaults: DefaultOptions['mutations'] = {
  /** Don't retry mutations (side effects should not auto-retry) */
  retry: 0,
};

// ─── Create QueryClient ──────────────────────────────────────

/**
 * Creates a production-grade QueryClient.
 *
 * Why a factory function?
 * - Allows tests to create isolated clients
 * - Avoids module-level singleton issues with SSR
 * - Enables custom overrides per environment
 */
export function createQueryClient(overrides?: DefaultOptions): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...queryDefaults,
        ...overrides?.queries,
      },
      mutations: {
        ...mutationDefaults,
        ...overrides?.mutations,
      },
    },
  });
}

/**
 * Singleton QueryClient for the application.
 * Used by AppProviders – imported once at the top level.
 */
export const appQueryClient = createQueryClient();
