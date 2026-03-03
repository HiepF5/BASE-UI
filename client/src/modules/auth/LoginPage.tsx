import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../core/api/apiClient';
import { BaseButton } from '../../components/base';
import toast from 'react-hot-toast';

const MOCK_AUTH_ENABLED = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// ============================================================
// LoginPage - JWT Auth (with mock auth support)
// ============================================================
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, mockLogin, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to intended page
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  React.useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (MOCK_AUTH_ENABLED) {
        // Mock login – no API call needed
        mockLogin(username, password);
        toast.success('Logged in (mock)');
      } else {
        // Real API login
        const res = await apiClient.post<{ access_token: string; user: any }>('/auth/login', {
          username,
          password,
        });
        login(res.access_token, res.user);
        toast.success('Login successful');
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Login failed');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter password"
              required
            />
          </div>
          <BaseButton type="submit" className="w-full" loading={loading}>
            Login
          </BaseButton>
        </form>
      </div>
    </div>
  );
}
