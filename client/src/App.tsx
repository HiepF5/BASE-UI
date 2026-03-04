import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/auth/PrivateRoute';

// Lazy-loaded pages
const AdminLayout = lazy(() =>
  import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const DashboardPage = lazy(() =>
  import('./modules/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const DynamicCrudPage = lazy(() =>
  import('./modules/dynamic-crud/DynamicCrudPage').then((m) => ({ default: m.DynamicCrudPage })),
);
const ConnectionsPage = lazy(() =>
  import('./modules/connections/ConnectionsPage').then((m) => ({ default: m.ConnectionsPage })),
);
const AiChatPanel = lazy(() =>
  import('./modules/ai-chat/AiChatPanel').then((m) => ({ default: m.AiChatPanel })),
);
const LoginPage = lazy(() =>
  import('./modules/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const TokenShowcasePage = lazy(() =>
  import('./modules/showcase/TokenShowcasePage').then((m) => ({ default: m.TokenShowcasePage })),
);
const ComponentShowcasePage = lazy(() =>
  import('./modules/showcase/ComponentShowcasePage').then((m) => ({
    default: m.ComponentShowcasePage,
  })),
);
const DataOverlayShowcasePage = lazy(() =>
  import('./modules/showcase/DataOverlayShowcasePage').then((m) => ({
    default: m.DataOverlayShowcasePage,
  })),
);
const MetadataShowcasePage = lazy(() =>
  import('./modules/showcase/MetadataShowcasePage').then((m) => ({
    default: m.MetadataShowcasePage,
  })),
);
const CrudShowcasePage = lazy(() =>
  import('./modules/showcase/CrudShowcasePage').then((m) => ({
    default: m.CrudShowcasePage,
  })),
);
const StateShowcasePage = lazy(() =>
  import('./modules/showcase/StateShowcasePage').then((m) => ({
    default: m.StateShowcasePage,
  })),
);
const RelationShowcasePage = lazy(() =>
  import('./modules/showcase/RelationShowcasePage').then((m) => ({
    default: m.RelationShowcasePage,
  })),
);
const QueryBuilderShowcasePage = lazy(() => import('./modules/showcase/QueryBuilderShowcasePage'));
const ExampleAppPage = lazy(() => import('./modules/example-app/ExampleAppPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="crud/:connectionId/:entity" element={<DynamicCrudPage />} />
            <Route path="ai" element={<AiChatPanel />} />
            <Route path="showcase/tokens" element={<TokenShowcasePage />} />
            <Route path="showcase/components" element={<ComponentShowcasePage />} />
            <Route path="showcase/data-overlay" element={<DataOverlayShowcasePage />} />
            <Route path="showcase/metadata" element={<MetadataShowcasePage />} />
            <Route path="showcase/crud" element={<CrudShowcasePage />} />
            <Route path="showcase/state" element={<StateShowcasePage />} />
            <Route path="showcase/relation" element={<RelationShowcasePage />} />
            <Route path="showcase/query-builder" element={<QueryBuilderShowcasePage />} />
            <Route path="example-app" element={<ExampleAppPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
