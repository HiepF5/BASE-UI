// ============================================================
// Auth Store - JWT token + user state (with persist & mock auth)
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthState } from '../types/auth.types';

const MOCK_AUTH_ENABLED = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/** Mock accounts for development */
const MOCK_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: 'admin123',
    user: { id: '1', username: 'admin', role: 'admin' },
  },
  demo: {
    password: 'demo123',
    user: { id: '2', username: 'demo', role: 'viewer' },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      mockLogin: (username: string, password: string) => {
        if (!MOCK_AUTH_ENABLED) {
          throw new Error('Mock auth is disabled');
        }
        const account = MOCK_ACCOUNTS[username];
        if (!account || account.password !== password) {
          throw new Error('Invalid username or password');
        }
        const token = `mock-jwt-${username}-${Date.now()}`;
        set({ token, user: account.user, isAuthenticated: true });
        return { token, user: account.user };
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
