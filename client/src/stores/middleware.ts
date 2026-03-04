// ============================================================
// Zustand Middleware Factory - Production patterns
// Provides: devtools, immer, persist helpers
// Follows State Management rules: Zustand for UI + Global state
// ============================================================

import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

// ─── Middleware Composition Helpers ──────────────────────────

/**
 * Wraps a store initialiser with `immer` + `devtools` middleware.
 *
 * Usage:
 * ```ts
 * export const useMyStore = create<MyState>()(
 *   withImmerDevtools<MyState>('MyStore', (set) => ({ ... }))
 * );
 * ```
 */
export function withImmerDevtools<T>(
  storeName: string,
  initialiser: StateCreator<T, [['zustand/devtools', never], ['zustand/immer', never]], []>,
): StateCreator<T, [], [['zustand/devtools', never], ['zustand/immer', never]]> {
  return devtools(immer(initialiser), {
    name: storeName,
    enabled: import.meta.env.DEV,
  });
}

/**
 * Selector factory for Zustand – creates a typed selector
 * that avoids unnecessary re-renders via shallow comparison.
 *
 * Usage:
 * ```ts
 * const selectPage = createSelector<TableStore, number>((s) => s.page);
 * const page = useTableStore(selectPage);
 * ```
 */
export function createSelector<S, R>(selector: (state: S) => R): (state: S) => R {
  return selector;
}

// ─── Re-export middleware for convenience ────────────────────
export { devtools, immer };
export type { StateCreator, StoreMutatorIdentifier };
