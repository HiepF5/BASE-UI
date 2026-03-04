import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore, type Theme } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../core/utils';
import { layoutConfig, type MenuItemConfig, type MenuSectionConfig } from '../config/layout.config';

// ============================================================
// AdminLayout — Config-driven shell
// ✅ Layout config driven (layout.config.ts)
// ✅ Menu render từ metadata (sections → items)
// ✅ Permission-aware menu (requiredRoles / requiredPermission)
// ✅ Dark/Light mode (theme toggle in header)
// ============================================================

// ─── Permission Helpers ──────────────────────────────────────

/** Check if a menu item is visible for the current user */
function isMenuItemVisible(item: MenuItemConfig, userRole: string | undefined): boolean {
  // No restrictions → always visible
  if (!item.requiredRoles?.length && !item.requiredPermission) return true;

  // Role-based gate
  if (item.requiredRoles?.length) {
    if (!userRole) return false;
    return item.requiredRoles.includes(userRole);
  }

  return true;
}

/** Filter a section's items by user permissions, hiding empty sections */
function filterSections(
  sections: MenuSectionConfig[],
  userRole: string | undefined,
): MenuSectionConfig[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isMenuItemVisible(item, userRole)),
    }))
    .filter((section) => section.items.length > 0);
}

// ─── Badge Colors ────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
};

// ─── Theme Toggle ────────────────────────────────────────────

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentIcon = resolvedTheme === 'dark' ? '🌙' : '☀️';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm
          text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
          dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800
          transition-colors"
        title={`Theme: ${theme}`}
      >
        <span>{currentIcon}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 py-1">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                theme === opt.value
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700',
              )}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
              {theme === opt.value && (
                <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Bell (placeholder) ────────────────────────

function NotificationBell() {
  const [count] = useState(3);

  return (
    <button
      className="relative flex items-center justify-center w-8 h-8 rounded-md
        text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
        dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800
        transition-colors"
      title="Notifications"
    >
      <span className="text-base">🔔</span>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center px-1 font-medium">
          {count}
        </span>
      )}
    </button>
  );
}

// ─── User Menu ───────────────────────────────────────────────

function UserMenu() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-md
          hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
          {initial}
        </div>
        {user && (
          <span className="text-sm text-neutral-600 dark:text-neutral-300 hidden sm:block">
            {user.username}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 py-1">
          {user && (
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700">
              <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {user.username}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                {user.role}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              navigate('/showcase/settings');
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Global Search ───────────────────────────────────────────

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close on route change
  useEffect(() => {
    setQuery('');
    setFocused(false);
  }, [location.pathname]);

  // Filter menu items that match the query
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return layoutConfig.sidebar.sections
      .flatMap((s) => s.items)
      .filter((item) => item.label.toLowerCase().includes(q) || item.to.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border px-3 py-1.5 transition-all',
          focused
            ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/30 w-72'
            : 'border-neutral-200 dark:border-neutral-700 w-56',
        )}
      >
        <span className="text-neutral-400 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search modules... (⌘K)"
          className="flex-1 bg-transparent text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 outline-none"
        />
        <kbd className="hidden sm:inline text-[10px] text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-600 rounded px-1 py-0.5 font-mono">
          ⌘K
        </kbd>
      </div>
      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.to}
              onMouseDown={() => navigate(item.to)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">{item.to}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Breadcrumb ──────────────────────────────────────────────

function Breadcrumb() {
  const location = useLocation();

  const breadcrumb = useMemo(() => {
    return layoutConfig.breadcrumbs.find((b) => location.pathname.startsWith(b.pattern));
  }, [location.pathname]);

  if (!breadcrumb) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 px-6 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
      <NavLink
        to="/dashboard"
        className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        Home
      </NavLink>
      <span className="text-neutral-300 dark:text-neutral-600">/</span>
      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
        {breadcrumb.icon && <span className="mr-1">{breadcrumb.icon}</span>}
        {breadcrumb.label}
      </span>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────

function SidebarSection({
  section,
  sidebarOpen,
  userRole,
}: {
  section: MenuSectionConfig;
  sidebarOpen: boolean;
  userRole: string | undefined;
}) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false);

  const visibleItems = useMemo(
    () => section.items.filter((item) => isMenuItemVisible(item, userRole)),
    [section.items, userRole],
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-1">
      {/* Section header */}
      {sidebarOpen && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        >
          <span>{section.label}</span>
          <span className={cn('transition-transform text-[8px]', collapsed ? '' : 'rotate-90')}>
            ▶
          </span>
        </button>
      )}

      {/* Items */}
      {!collapsed && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                        BADGE_COLORS[item.badgeColor ?? 'primary'],
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════

export function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const config = layoutConfig;

  // Filter sections by user permissions — menu render from metadata
  const visibleSections = useMemo(
    () => filterSections(config.sidebar.sections, user?.role),
    [config.sidebar.sections, user?.role],
  );

  // Keyboard shortcut: ⌘K focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('[placeholder*="Search modules"]');
        input?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          'bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-200',
          sidebarOpen ? config.sidebar.width.expanded : config.sidebar.width.collapsed,
        )}
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">
            {sidebarOpen ? config.brand.name : config.brand.shortName}
          </span>
        </div>

        {/* Nav — config-driven sections */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          {visibleSections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              sidebarOpen={sidebarOpen}
              userRole={user?.role}
            />
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 shrink-0">
          {/* Left: Search */}
          <div className="flex items-center gap-4">
            {config.header.showSearch && <GlobalSearch />}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {config.header.showThemeToggle && <ThemeToggle />}
            {config.header.showNotifications && <NotificationBell />}
            {config.header.showUserMenu && <UserMenu />}
          </div>
        </header>

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
