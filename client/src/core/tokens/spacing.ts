/**
 * Spacing Tokens
 *
 * 4px-based scale (0.25rem increments).
 * Naming convention: số = multiplier of 4px.
 * Ví dụ: space-4 = 4 × 4px = 16px = 1rem.
 */

export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  18: '4.5rem', // 72px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

/** Semantic spacing aliases cho component usage */
export const semanticSpacing = {
  /** Khoảng cách bên trong nhỏ nhất (input padding, badge) */
  'component-xs': spacing[1], // 4px
  /** Khoảng cách bên trong mặc định (button padding) */
  'component-sm': spacing[2], // 8px
  /** Khoảng cách bên trong lớn (card padding) */
  'component-md': spacing[3], // 12px
  /** Card/section padding */
  'component-lg': spacing[4], // 16px
  /** Container padding */
  'component-xl': spacing[6], // 24px

  /** Gap giữa các item trong group */
  'gap-xs': spacing[1], // 4px
  'gap-sm': spacing[2], // 8px
  'gap-md': spacing[3], // 12px
  'gap-lg': spacing[4], // 16px
  'gap-xl': spacing[6], // 24px

  /** Page/layout spacing */
  'page-x': spacing[6], // 24px
  'page-y': spacing[6], // 24px

  /** Section spacing */
  'section-gap': spacing[8], // 32px
} as const;

export type SpacingToken = keyof typeof spacing;
