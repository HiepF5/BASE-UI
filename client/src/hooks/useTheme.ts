/**
 * useTheme Hook
 *
 * Convenient accessor for theme state.
 * Theo rule Design System.md: Theme switch qua data-theme attribute.
 *
 * Usage:
 *   const { theme, resolvedTheme, setTheme, isDark } = useTheme()
 *   setTheme('dark')
 *   setTheme('system')
 */

import { useUIStore, type Theme } from '@/stores/uiStore';

export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  const resolvedTheme = useUIStore((s) => s.resolvedTheme);
  const setTheme = useUIStore((s) => s.setTheme);

  return {
    /** Current preference: 'light' | 'dark' | 'system' */
    theme,
    /** Resolved to actual: 'light' | 'dark' */
    resolvedTheme,
    /** Update theme preference */
    setTheme,
    /** Shorthand boolean */
    isDark: resolvedTheme === 'dark',
    /** Toggle between light and dark */
    toggleTheme: () => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    },
    /** Cycle: light → dark → system → light */
    cycleTheme: () => {
      const cycle: Record<Theme, Theme> = {
        light: 'dark',
        dark: 'system',
        system: 'light',
      };
      setTheme(cycle[theme]);
    },
  };
}
