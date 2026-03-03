import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { DynamicCrudPage } from './modules/dynamic-crud/DynamicCrudPage';
import { ConnectionsPage } from './modules/connections/ConnectionsPage';
import { LoginPage } from './modules/auth/LoginPage';
import { AiChatPanel } from './modules/ai-chat/AiChatPanel';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="crud/:connectionId/:entity" element={<DynamicCrudPage />} />
          <Route path="ai" element={<AiChatPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
