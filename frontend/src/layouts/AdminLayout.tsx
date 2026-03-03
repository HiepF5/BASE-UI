import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, Database, Settings,
  Table2, MessageSquare, LogOut, ChevronLeft, ChevronRight,
  Plug, Users, Shield, Activity,
} from 'lucide-react';
import { cn } from '@/core/utils';
import { useAuthStore, useUiStore } from '@/stores';
import { BaseButton } from '@/components/base';

/* ── Navigation items ── */
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    path: '/',              icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'CRUD Manager', path: '/crud',          icon: <Table2 className="h-5 w-5" /> },
  { label: 'Connections',  path: '/connections',   icon: <Plug className="h-5 w-5" /> },
  { label: 'Users',        path: '/users',         icon: <Users className="h-5 w-5" /> },
  { label: 'Audit Log',    path: '/audit',         icon: <Activity className="h-5 w-5" /> },
  { label: 'Settings',     path: '/settings',      icon: <Settings className="h-5 w-5" /> },
];

/* ═══════════════════════════════════════════════════════════
   AdminLayout — Sidebar + Header + Main + AI Panel
   ═══════════════════════════════════════════════════════════ */

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebarCollapse, aiPanelOpen, toggleAiPanel } = useUiStore();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-primary-600">Base UI</span>
          )}
          <button
            onClick={toggleSidebarCollapse}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  sidebarCollapsed && 'justify-center px-0',
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3">
          {!sidebarCollapsed && user && (
            <div className="mb-2 truncate text-xs text-gray-500">{user.email ?? user.username}</div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-danger-600"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {NAV_ITEMS.find((n) =>
              n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path),
            )?.label ?? 'Base UI'}
          </h1>

          <div className="flex items-center gap-3">
            {/* AI Chat toggle */}
            <BaseButton
              variant={aiPanelOpen ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleAiPanel}
            >
              <MessageSquare className="h-4 w-4" />
              AI Chat
            </BaseButton>

            {/* User avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          {/* AI Panel */}
          {aiPanelOpen && (
            <aside className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden animate-slide-in">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="font-semibold text-gray-900">AI Builder</h2>
                <BaseButton variant="ghost" size="icon" onClick={toggleAiPanel}>
                  <X className="h-4 w-4" />
                </BaseButton>
              </div>
              {/* AiChatPanel is lazy-loaded inside */}
              <div className="flex-1 overflow-hidden" id="ai-chat-container" />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
