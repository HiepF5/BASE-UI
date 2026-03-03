/**
 * Typography Tokens
 *
 * Font family, size, weight, line-height, letter-spacing.
 * Theo rule: Inter làm font chính, monospace cho code.
 */

// ── Font Families ───────────────────────────────────────────
export const fontFamily = {
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

// ── Font Sizes ──────────────────────────────────────────────
export const fontSize = {
  /** 12px – Small labels, captions */
  xs: ['0.75rem', { lineHeight: '1rem' }],
  /** 14px – Body small, table cells */
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  /** 16px – Body default */
  base: ['1rem', { lineHeight: '1.5rem' }],
  /** 18px – Large body, sub-headings */
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  /** 20px – Section headings */
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  /** 24px – Page headings */
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  /** 30px – Large headings */
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  /** 36px – Hero headings */
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
} as const;

// ── Font Weights ────────────────────────────────────────────
export const fontWeight = {
  /** Body text thường */
  normal: '400',
  /** Nhấn nhẹ, label */
  medium: '500',
  /** Heading, button */
  semibold: '600',
  /** Hero headings */
  bold: '700',
} as const;

// ── Letter Spacing ──────────────────────────────────────────
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
} as const;

// ── Semantic Typography Presets ──────────────────────────────
export const textStyles = {
  /** Page title (24px, semibold) */
  'heading-lg': {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  /** Section title (20px, semibold) */
  'heading-md': {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  /** Card title (16px, semibold) */
  'heading-sm': {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    fontWeight: '600',
  },
  /** Default body (14px, normal) */
  'body-md': {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: '400',
  },
  /** Small body / table cells (12px) */
  'body-sm': {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: '400',
  },
  /** Label for form fields (14px, medium) */
  label: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: '500',
  },
  /** Code / monospace (14px) */
  code: {
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    fontWeight: '400',
    fontFamily: fontFamily.mono,
  },
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
export type TextStyleToken = keyof typeof textStyles;
