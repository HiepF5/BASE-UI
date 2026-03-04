import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../core/utils';

// ============================================================
// AdminLayout - Sidebar + Header + Content area
// ============================================================
export function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/connections', label: 'Connections', icon: '🔌' },
    { to: '/ai', label: 'AI Builder', icon: '🤖' },
    { to: '/showcase/tokens', label: 'Tokens', icon: '🎨' },
    { to: '/showcase/components', label: 'Components', icon: '🧩' },
    { to: '/showcase/data-overlay', label: 'Data & Overlay', icon: '📊' },
    { to: '/showcase/metadata', label: 'Metadata', icon: '🏗️' },
    { to: '/showcase/crud', label: 'CRUD Engine', icon: '⚡' },
    { to: '/showcase/state', label: 'State Mgmt', icon: '🏗️' },
    { to: '/showcase/relation', label: 'Relations', icon: '🔗' },
  ];

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r flex flex-col transition-all duration-200',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-primary-600 text-lg">
            {sidebarOpen ? 'Admin Platform' : 'AP'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )
              }
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          <button
            onClick={toggleSidebar}
            className="w-full text-xs text-neutral-400 hover:text-neutral-600"
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <div className="text-sm text-neutral-500">Metadata-Driven Admin Platform</div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-neutral-600">{user.username}</span>}
            <button onClick={handleLogout} className="text-sm text-neutral-500 hover:text-red-600">
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
