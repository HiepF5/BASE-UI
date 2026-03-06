// ============================================================
// Auth Hooks
// ============================================================

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import type { LoginRequest } from '../types/auth.types';

const MOCK_AUTH_ENABLED = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export function useAuth() {
  const { login, logout, mockLogin, isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      if (MOCK_AUTH_ENABLED) {
        mockLogin(credentials.username, credentials.password);
        toast.success('Logged in (mock)');
        return;
      }

      const res = await authApi.login(credentials);
      login(res.access_token, res.user);
      toast.success('Login successful');
    },
    [login, mockLogin],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return {
    isAuthenticated,
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
  };
}
