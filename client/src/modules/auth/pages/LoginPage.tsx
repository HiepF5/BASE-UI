// ============================================================
// LoginPage - JWT Auth (with mock auth support)
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { LoginForm } from '../components/LoginForm';

const MOCK_AUTH_ENABLED = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login, mockLogin, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to intended page
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (username: string, password: string) => {
    setLoading(true);
    try {
      if (MOCK_AUTH_ENABLED) {
        mockLogin(username, password);
        toast.success('Logged in (mock)');
      } else {
        const res = await authApi.login({ username, password });
        login(res.access_token, res.user);
        toast.success('Login successful');
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Platform</h1>
        {MOCK_AUTH_ENABLED && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
            Mock Auth enabled — use <strong>admin / admin123</strong> or{' '}
            <strong>demo / demo123</strong>
          </div>
        )}
        <LoginForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
