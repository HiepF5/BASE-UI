import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================
// UI Store - Sidebar, modal, theme, global UI state
// Production: devtools middleware, typed selectors
// ============================================================

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  activeModal: string | null;
  modalData: unknown;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;

  activeConnection: string | null;
  setActiveConnection: (id: string | null) => void;

  /** Theme preference: 'light' | 'dark' | 'system' */
  theme: Theme;
  /** Resolved effective theme (always 'light' or 'dark') */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

/** Resolve theme based on system preference */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/** Apply theme to DOM */
function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved);
}

/** Read saved theme from localStorage */
function getSavedTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'light';
}

const initialTheme = getSavedTheme();
const initialResolved = resolveTheme(initialTheme);
// Apply immediately to avoid flash
applyTheme(initialResolved);

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'toggleSidebar'),
      setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),

      activeModal: null,
      modalData: null,
      openModal: (name, data = null) =>
        set({ activeModal: name, modalData: data }, false, 'openModal'),
      closeModal: () => set({ activeModal: null, modalData: null }, false, 'closeModal'),

      activeConnection: null,
      setActiveConnection: (id) => set({ activeConnection: id }, false, 'setActiveConnection'),

      theme: initialTheme,
      resolvedTheme: initialResolved,
      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        localStorage.setItem('theme', theme);
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved }, false, 'setTheme');
      },
    }),
    {
      name: 'UIStore',
      enabled: import.meta.env.DEV,
    },
  ),
);

// Listen for system theme changes (when theme === 'system')
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, setTheme } = useUIStore.getState();
    if (theme === 'system') {
      setTheme('system'); // re-resolve
    }
  });
}
