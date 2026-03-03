/**
 * Z-Index Tokens
 *
 * Layering scale để tránh z-index wars.
 */

export const zIndex = {
  /** Below default (hidden, behind content) */
  hide: -1,
  /** Default stacking */
  base: 0,
  /** Slightly above (sticky columns) */
  docked: 10,
  /** Dropdown menus */
  dropdown: 100,
  /** Sticky headers */
  sticky: 200,
  /** Modal backdrop */
  modalBackdrop: 300,
  /** Modal content */
  modal: 400,
  /** Toast notifications */
  toast: 500,
  /** Tooltip */
  tooltip: 600,
  /** Maximum (dev tools overlay) */
  max: 9999,
} as const;

export type ZIndexToken = keyof typeof zIndex;
