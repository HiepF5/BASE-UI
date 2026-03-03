/**
 * Theme Tokens
 *
 * Semantic color mapping cho light/dark theme.
 * CSS variables sẽ reference values từ đây.
 * Switch theme bằng: document.documentElement.setAttribute('data-theme', 'dark')
 */

import { primary, accent, neutral, success, warning, danger, info } from './colors';

export interface ThemeTokens {
  /** Primary brand */
  colorPrimary: string;
  colorPrimaryHover: string;
  colorPrimaryLight: string;
  colorPrimaryDark: string;

  /** Accent */
  colorAccent: string;
  colorAccentHover: string;

  /** Semantic */
  colorSuccess: string;
  colorSuccessLight: string;
  colorWarning: string;
  colorWarningLight: string;
  colorDanger: string;
  colorDangerHover: string;
  colorDangerLight: string;
  colorInfo: string;
  colorInfoLight: string;

  /** Backgrounds */
  colorBg: string;
  colorBgSecondary: string;
  colorBgTertiary: string;
  colorBgElevated: string;

  /** Text */
  colorText: string;
  colorTextSecondary: string;
  colorTextMuted: string;
  colorTextInverse: string;

  /** Borders */
  colorBorder: string;
  colorBorderHover: string;
  colorBorderFocus: string;

  /** Shadows */
  shadowXs: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
}

// ── Light Theme ────────────────────────────────────────────
export const lightTheme: ThemeTokens = {
  colorPrimary: primary[600],
  colorPrimaryHover: primary[700],
  colorPrimaryLight: primary[50],
  colorPrimaryDark: primary[800],

  colorAccent: accent[600],
  colorAccentHover: accent[700],

  colorSuccess: success[600],
  colorSuccessLight: success[50],
  colorWarning: warning[600],
  colorWarningLight: warning[50],
  colorDanger: danger[600],
  colorDangerHover: danger[700],
  colorDangerLight: danger[50],
  colorInfo: info[600],
  colorInfoLight: info[50],

  colorBg: neutral[0],
  colorBgSecondary: neutral[50],
  colorBgTertiary: neutral[100],
  colorBgElevated: neutral[0],

  colorText: neutral[900],
  colorTextSecondary: neutral[600],
  colorTextMuted: neutral[400],
  colorTextInverse: neutral[0],

  colorBorder: neutral[200],
  colorBorderHover: neutral[300],
  colorBorderFocus: primary[500],

  shadowXs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
  shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// ── Dark Theme ─────────────────────────────────────────────
export const darkTheme: ThemeTokens = {
  colorPrimary: primary[500],
  colorPrimaryHover: primary[400],
  colorPrimaryLight: '#1e293b', // primary tint trên dark bg
  colorPrimaryDark: primary[300],

  colorAccent: accent[400],
  colorAccentHover: accent[300],

  colorSuccess: success[500],
  colorSuccessLight: '#0f291a',
  colorWarning: warning[500],
  colorWarningLight: '#2a1f06',
  colorDanger: danger[500],
  colorDangerHover: danger[400],
  colorDangerLight: '#2d1215',
  colorInfo: info[400],
  colorInfoLight: '#0c2636',

  colorBg: '#0f172a', // slate-900
  colorBgSecondary: '#1e293b', // slate-800
  colorBgTertiary: '#334155', // slate-700
  colorBgElevated: '#1e293b',

  colorText: neutral[100],
  colorTextSecondary: neutral[300],
  colorTextMuted: neutral[500],
  colorTextInverse: neutral[900],

  colorBorder: '#334155', // slate-700
  colorBorderHover: '#475569', // slate-600
  colorBorderFocus: primary[400],

  shadowXs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.35)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.35)',
  shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
};
