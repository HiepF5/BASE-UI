import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useAuthStore } from '@/stores';
import { Spinner } from '@/components/base';

/* ── Lazy imports ── */
const LoginPage       = lazy(() => import('@/modules/auth/LoginPage'));
const DashboardPage   = lazy(() => import('@/modules/dashboard/DashboardPage'));
const DynamicCrudPage = lazy(() => import('@/modules/dynamic-crud/DynamicCrudPage'));
const ConnectionsPage = lazy(() => import('@/modules/connections/ConnectionsPage'));
const AiChatPanel     = lazy(() => import('@/modules/ai-chat/AiChatPanel'));
const UsersPage       = lazy(() => import('@/modules/users/UsersPage'));
const AuditPage       = lazy(() => import('@/modules/audit/AuditPage'));
const SettingsPage    = lazy(() => import('@/modules/settings/SettingsPage'));

/* ── Auth guard ── */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const LoadingFallback = () => (
  <div className="flex h-full items-center justify-center">
    <Spinner size="lg" />
  </div>
);

/* ═══ App ═══ */
export const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — AdminLayout wraps all */}
        <Route
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="crud" element={<DynamicCrudPage />} />
          <Route path="crud/:entity" element={<DynamicCrudPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
