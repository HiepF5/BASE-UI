import { create } from 'zustand';

// ============================================================
// UI Store - Sidebar, modal, theme, global UI state
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

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeModal: null,
  modalData: null,
  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  activeConnection: null,
  setActiveConnection: (id) => set({ activeConnection: id }),

  theme: initialTheme,
  resolvedTheme: initialResolved,
  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },
}));

// Listen for system theme changes (when theme === 'system')
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, setTheme } = useUIStore.getState();
    if (theme === 'system') {
      setTheme('system'); // re-resolve
    }
  });
}
