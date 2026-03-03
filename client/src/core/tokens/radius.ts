/**
 * Border Radius Tokens
 *
 * Consistent rounding scale.
 */

export const borderRadius = {
  /** No rounding */
  none: '0',
  /** Subtle – 2px */
  sm: '0.125rem',
  /** Default – 4px */
  DEFAULT: '0.25rem',
  /** Buttons, inputs – 6px */
  md: '0.375rem',
  /** Cards – 8px */
  lg: '0.5rem',
  /** Large cards, modals – 12px */
  xl: '0.75rem',
  /** Very large – 16px */
  '2xl': '1rem',
  /** Pill shape – 24px */
  '3xl': '1.5rem',
  /** Circle / pill */
  full: '9999px',
} as const;

export type BorderRadiusToken = keyof typeof borderRadius;
