/**
 * Design Tokens – Barrel Export
 *
 * Single import point cho toàn bộ tokens:
 *   import { colors, spacing, fontSize, shadows, ... } from '@/core/tokens'
 */

export { colors, primary, accent, success, warning, danger, info, neutral } from './colors';
export type { ColorScale, ColorToken } from './colors';

export { spacing, semanticSpacing } from './spacing';
export type { SpacingToken } from './spacing';

export { fontFamily, fontSize, fontWeight, letterSpacing, textStyles } from './typography';
export type { FontSizeToken, FontWeightToken, TextStyleToken } from './typography';

export { shadows, semanticShadows, darkShadows } from './shadows';
export type { ShadowToken } from './shadows';

export { borderRadius } from './radius';
export type { BorderRadiusToken } from './radius';

export { transition, animation } from './animations';
export type { TransitionToken, AnimationToken } from './animations';

export { zIndex } from './zIndex';
export type { ZIndexToken } from './zIndex';

export { lightTheme, darkTheme } from './theme';
export type { ThemeTokens } from './theme';
