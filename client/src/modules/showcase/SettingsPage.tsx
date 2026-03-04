import React, { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

// ============================================================
// SettingsPage – Screen 6: Settings Module (Enterprise)
// Demonstrates: User management, Role/Permission RBAC,
// Feature flags, System config, Permission guard,
// Route guard concepts, Dynamic role-based field hide/show
// ============================================================

// ─── Types ───────────────────────────────────────────────────

type Role = 'admin' | 'editor' | 'viewer';

interface Permission {
  key: string;
  label: string;
  description: string;
  module: string;
}

interface RoleConfig {
  role: Role;
  label: string;
  color: string;
  bgColor: string;
  permissions: string[];
}

interface ManagedUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  environment: 'all' | 'dev' | 'staging' | 'production';
  createdBy: string;
}

interface SystemSetting {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: string | number | boolean;
  options?: { label: string; value: string }[];
  category: string;
  requiresRestart?: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  {
    key: 'users.read',
    label: 'View Users',
    description: 'Can view user list & details',
    module: 'Users',
  },
  {
    key: 'users.create',
    label: 'Create Users',
    description: 'Can create new users',
    module: 'Users',
  },
  {
    key: 'users.update',
    label: 'Edit Users',
    description: 'Can edit user profiles',
    module: 'Users',
  },
  { key: 'users.delete', label: 'Delete Users', description: 'Can delete users', module: 'Users' },
  {
    key: 'orders.read',
    label: 'View Orders',
    description: 'Can view order list',
    module: 'Orders',
  },
  {
    key: 'orders.create',
    label: 'Create Orders',
    description: 'Can create new orders',
    module: 'Orders',
  },
  { key: 'orders.update', label: 'Edit Orders', description: 'Can edit orders', module: 'Orders' },
  {
    key: 'orders.delete',
    label: 'Delete Orders',
    description: 'Can delete orders',
    module: 'Orders',
  },
  {
    key: 'settings.read',
    label: 'View Settings',
    description: 'Can view system settings',
    module: 'Settings',
  },
  {
    key: 'settings.manage',
    label: 'Manage Settings',
    description: 'Can modify system settings',
    module: 'Settings',
  },
  {
    key: 'dashboard.view',
    label: 'View Dashboard',
    description: 'Can access dashboard',
    module: 'Dashboard',
  },
  {
    key: 'reports.export',
    label: 'Export Reports',
    description: 'Can export CSV/PDF reports',
    module: 'Reports',
  },
];

const INITIAL_ROLES: RoleConfig[] = [
  {
    role: 'admin',
    label: 'Administrator',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    permissions: ALL_PERMISSIONS.map((p) => p.key),
  },
  {
    role: 'editor',
    label: 'Editor',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    permissions: [
      'users.read',
      'orders.read',
      'orders.create',
      'orders.update',
      'dashboard.view',
      'reports.export',
    ],
  },
  {
    role: 'viewer',
    label: 'Viewer',
    color: 'text-neutral-700',
    bgColor: 'bg-neutral-50 border-neutral-200',
    permissions: ['users.read', 'orders.read', 'dashboard.view'],
  },
];

const INITIAL_USERS: ManagedUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    active: true,
    createdAt: '2025-01-15',
    lastLogin: '2026-03-04',
  },
  {
    id: '2',
    username: 'editor01',
    email: 'editor@example.com',
    role: 'editor',
    active: true,
    createdAt: '2025-03-20',
    lastLogin: '2026-03-03',
  },
  {
    id: '3',
    username: 'viewer01',
    email: 'viewer@example.com',
    role: 'viewer',
    active: true,
    createdAt: '2025-06-10',
    lastLogin: '2026-02-28',
  },
  {
    id: '4',
    username: 'john.doe',
    email: 'john@example.com',
    role: 'editor',
    active: true,
    createdAt: '2025-08-01',
    lastLogin: '2026-03-01',
  },
  {
    id: '5',
    username: 'jane.smith',
    email: 'jane@example.com',
    role: 'viewer',
    active: false,
    createdAt: '2025-09-15',
    lastLogin: null,
  },
];

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    key: 'dark_mode',
    label: 'Dark Mode',
    description: 'Enable dark theme toggle in topbar',
    enabled: true,
    environment: 'all',
    createdBy: 'admin',
  },
  {
    key: 'ai_query',
    label: 'AI Query Builder',
    description: 'Natural language → filter AST conversion',
    enabled: false,
    environment: 'dev',
    createdBy: 'admin',
  },
  {
    key: 'bulk_export',
    label: 'Bulk Export',
    description: 'Export large datasets as CSV/Excel',
    enabled: true,
    environment: 'all',
    createdBy: 'admin',
  },
  {
    key: 'realtime_sync',
    label: 'Realtime Sync',
    description: 'WebSocket-based live data updates',
    enabled: false,
    environment: 'staging',
    createdBy: 'admin',
  },
  {
    key: 'audit_log',
    label: 'Audit Log',
    description: 'Track all user actions with change diff',
    enabled: true,
    environment: 'production',
    createdBy: 'admin',
  },
  {
    key: 'command_palette',
    label: 'Command Palette',
    description: 'Global Cmd+K search & navigation',
    enabled: false,
    environment: 'dev',
    createdBy: 'admin',
  },
];

const INITIAL_SETTINGS: SystemSetting[] = [
  {
    key: 'app_name',
    label: 'Application Name',
    description: 'Displayed in sidebar & browser tab',
    type: 'text',
    value: 'Admin Platform',
    category: 'General',
  },
  {
    key: 'default_page_size',
    label: 'Default Page Size',
    description: 'Number of rows per page in tables',
    type: 'number',
    value: 25,
    category: 'General',
  },
  {
    key: 'maintenance_mode',
    label: 'Maintenance Mode',
    description: 'Show maintenance banner to non-admin users',
    type: 'boolean',
    value: false,
    category: 'General',
  },
  {
    key: 'session_timeout',
    label: 'Session Timeout (min)',
    description: 'Auto-logout after inactivity',
    type: 'number',
    value: 30,
    category: 'Security',
  },
  {
    key: 'max_login_attempts',
    label: 'Max Login Attempts',
    description: 'Lock account after N failed attempts',
    type: 'number',
    value: 5,
    category: 'Security',
  },
  {
    key: 'password_min_length',
    label: 'Min Password Length',
    description: 'Minimum characters for password policy',
    type: 'number',
    value: 8,
    category: 'Security',
  },
  {
    key: 'require_2fa',
    label: 'Require 2FA',
    description: 'Force two-factor auth for all users',
    type: 'boolean',
    value: false,
    category: 'Security',
  },
  {
    key: 'default_role',
    label: 'Default Role',
    description: 'Role assigned to new users',
    type: 'select',
    value: 'viewer',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' },
    ],
    category: 'Security',
  },
  {
    key: 'smtp_host',
    label: 'SMTP Host',
    description: 'Email server address',
    type: 'text',
    value: 'smtp.example.com',
    category: 'Email',
  },
  {
    key: 'smtp_port',
    label: 'SMTP Port',
    description: 'Email server port',
    type: 'number',
    value: 587,
    category: 'Email',
  },
  {
    key: 'email_from',
    label: 'From Address',
    description: 'Default sender email',
    type: 'text',
    value: 'noreply@admin.io',
    category: 'Email',
  },
  {
    key: 'rate_limit_api',
    label: 'API Rate Limit',
    description: 'Max requests per minute per user',
    type: 'number',
    value: 100,
    category: 'Performance',
  },
  {
    key: 'cache_ttl',
    label: 'Cache TTL (sec)',
    description: 'Time-to-live for metadata cache',
    type: 'number',
    value: 300,
    category: 'Performance',
    requiresRestart: true,
  },
];

// ─── Permission Helper (simulates guard logic) ──────────────

function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const currentRole = (user?.role ?? 'viewer') as Role;

  // Find role config to resolve permissions
  const roleConfig = INITIAL_ROLES.find((r) => r.role === currentRole);
  const userPermissions = useMemo(() => roleConfig?.permissions ?? [], [roleConfig]);

  const hasPermission = useCallback(
    (perm: string) => currentRole === 'admin' || userPermissions.includes(perm),
    [currentRole, userPermissions],
  );

  const isAdmin = currentRole === 'admin';

  return { currentRole, hasPermission, isAdmin, userPermissions };
}

// ─── Section Wrapper ─────────────────────────────────────────

function Section({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Tab Component ───────────────────────────────────────────

function getTabStyle(isActive: boolean, isLocked?: boolean): string {
  if (isActive) return 'bg-white text-primary-700 shadow-sm';
  if (isLocked) return 'text-neutral-400 cursor-not-allowed';
  return 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50';
}

function getDeleteTitle(canDelete: boolean, isSuperAdmin: boolean): string {
  if (!canDelete) return 'Permission denied';
  if (isSuperAdmin) return 'Cannot delete admin';
  return 'Delete user';
}

function SettingsTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; icon: string; locked?: boolean }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => !tab.locked && onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${getTabStyle(active === tab.key, tab.locked)}`}
          title={tab.locked ? 'Insufficient permissions' : undefined}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.locked && <span className="text-[10px]">🔒</span>}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. USER MANAGEMENT TAB
// ═══════════════════════════════════════════════════════════════

function UserManagementTab() {
  const { hasPermission, isAdmin, currentRole } = usePermissions();
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const canEdit = hasPermission('users.update');
  const canCreate = hasPermission('users.create');
  const canDelete = hasPermission('users.delete');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const toggleActive = (id: string) => {
    if (!canEdit) {
      toast.error('Permission denied: users.update required');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    toast.success('User status updated');
  };

  const changeRole = (id: string, role: Role) => {
    if (!isAdmin) {
      toast.error('Only admins can change roles');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success(`Role updated to ${role}`);
  };

  const deleteUser = (id: string) => {
    if (!canDelete) {
      toast.error('Permission denied: users.delete required');
      return;
    }
    if (id === '1') {
      toast.error('Cannot delete primary admin');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('User deleted');
  };

  const addUser = (user: Omit<ManagedUser, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser: ManagedUser = {
      ...user,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };
    setUsers((prev) => [...prev, newUser]);
    toast.success(`User "${user.username}" created`);
    setShowAddModal(false);
  };

  const roleBadge = (role: Role) => {
    const config: Record<Role, string> = {
      admin: 'bg-red-100 text-red-700',
      editor: 'bg-blue-100 text-blue-700',
      viewer: 'bg-neutral-100 text-neutral-600',
    };
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Permission Guard Banner */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
          🔒 You are logged in as <strong>{currentRole}</strong>. Some actions are restricted.
          {!canEdit && ' Cannot edit users.'}
          {!canDelete && ' Cannot delete users.'}
          {!canCreate && ' Cannot create users.'}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="border border-neutral-300 rounded-md px-3 py-1.5 text-sm w-56 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
            className="border border-neutral-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button
          onClick={() => (canCreate ? setShowAddModal(true) : toast.error('Permission denied'))}
          disabled={!canCreate}
          className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700
            disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* User Table */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <th className="px-4 py-2.5 font-medium text-neutral-600">User</th>
              <th className="px-4 py-2.5 font-medium text-neutral-600">Role</th>
              <th className="px-4 py-2.5 font-medium text-neutral-600">Status</th>
              <th className="px-4 py-2.5 font-medium text-neutral-600">Last Login</th>
              <th className="px-4 py-2.5 font-medium text-neutral-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-2.5">
                  <div>
                    <span className="font-medium text-neutral-800">{u.username}</span>
                    <span className="block text-xs text-neutral-500">{u.email}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  {editingId === u.id && isAdmin ? (
                    <select
                      value={u.role}
                      onChange={(e) => {
                        changeRole(u.id, e.target.value as Role);
                        setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="border border-primary-300 rounded px-2 py-0.5 text-xs bg-white focus:ring-1 focus:ring-primary-500 outline-none"
                    >
                      <option value="admin">admin</option>
                      <option value="editor">editor</option>
                      <option value="viewer">viewer</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => isAdmin && setEditingId(u.id)}
                      className={isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                      title={isAdmin ? 'Click to change role' : 'Admin only'}
                    >
                      {roleBadge(u.role)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => toggleActive(u.id)}
                    disabled={!canEdit}
                    className="flex items-center gap-1.5 disabled:cursor-not-allowed"
                    title={canEdit ? 'Toggle active/inactive' : 'Permission denied'}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-neutral-300'}`}
                    />
                    <span className={`text-xs ${u.active ? 'text-green-700' : 'text-neutral-500'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{u.lastLogin ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={!canDelete || u.id === '1'}
                    className="text-xs text-neutral-400 hover:text-red-500 disabled:hover:text-neutral-400 disabled:cursor-not-allowed transition-colors"
                    title={getDeleteTitle(canDelete, u.id === '1')}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-neutral-500">
        <span>Total: {users.length}</span>
        <span>Active: {users.filter((u) => u.active).length}</span>
        <span>Admin: {users.filter((u) => u.role === 'admin').length}</span>
        <span>Editor: {users.filter((u) => u.role === 'editor').length}</span>
        <span>Viewer: {users.filter((u) => u.role === 'viewer').length}</span>
      </div>

      {/* Add User Modal (inline) */}
      {showAddModal && <AddUserModal onAdd={addUser} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddUserModal({
  onAdd,
  onClose,
}: {
  onAdd: (user: Omit<ManagedUser, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toast.error('Username and email required');
      return;
    }
    onAdd({ username: username.trim(), email: email.trim(), role, active: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-neutral-800 mb-4">Add New User</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. new.user"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-neutral-600 hover:text-neutral-800 border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. ROLE / PERMISSION TAB
// ═══════════════════════════════════════════════════════════════

function RolePermissionTab() {
  const { isAdmin, currentRole } = usePermissions();
  const [roles, setRoles] = useState<RoleConfig[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>('admin');

  const activeRoleConfig = roles.find((r) => r.role === selectedRole) ?? roles[0];

  const permsByModule = useMemo(() => {
    const grouped = new Map<string, Permission[]>();
    for (const p of ALL_PERMISSIONS) {
      if (!grouped.has(p.module)) grouped.set(p.module, []);
      grouped.get(p.module)?.push(p);
    }
    return grouped;
  }, []);

  const togglePermission = (permKey: string) => {
    if (!isAdmin) {
      toast.error('Only admins can modify role permissions');
      return;
    }
    if (selectedRole === 'admin') {
      toast.error('Admin role cannot be modified');
      return;
    }

    setRoles((prev) =>
      prev.map((r) => {
        if (r.role !== selectedRole) return r;
        const has = r.permissions.includes(permKey);
        return {
          ...r,
          permissions: has
            ? r.permissions.filter((p) => p !== permKey)
            : [...r.permissions, permKey],
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      {/* Guard Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
        <strong>RBAC Architecture:</strong> Request → JwtAuthGuard → RolesGuard → Controller.
        Decorators like <code className="bg-blue-100 px-1 rounded">@Roles('admin')</code> protect
        endpoints. Frontend uses{' '}
        <code className="bg-blue-100 px-1 rounded">hasPermission(key)</code> for UI guards.
      </div>

      {/* Role tabs */}
      <div className="flex gap-2">
        {roles.map((r) => (
          <button
            key={r.role}
            onClick={() => setSelectedRole(r.role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${
                selectedRole === r.role
                  ? `${r.bgColor} ${r.color} border-current shadow-sm`
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
          >
            {r.label}
            <span className="ml-2 text-[10px] opacity-70">
              ({r.permissions.length}/{ALL_PERMISSIONS.length})
            </span>
          </button>
        ))}
      </div>

      {/* Permission matrix */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        {Array.from(permsByModule.entries()).map(([module, perms]) => (
          <div key={module} className="border-b border-neutral-100 last:border-0">
            <div className="bg-neutral-50 px-4 py-2">
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                {module}
              </span>
            </div>
            <div className="divide-y divide-neutral-50">
              {perms.map((perm) => {
                const hasIt = activeRoleConfig.permissions.includes(perm.key);
                const locked = selectedRole === 'admin' || !isAdmin;
                return (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-neutral-800">{perm.label}</span>
                      <span className="block text-xs text-neutral-500">{perm.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] text-neutral-400 font-mono">{perm.key}</code>
                      <button
                        onClick={() => togglePermission(perm.key)}
                        disabled={locked}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200
                          ${hasIt ? 'bg-primary-500' : 'bg-neutral-300'}
                          ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                            ${hasIt ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic field hide/show demo */}
      <Section
        title="Dynamic Role-Based Field Visibility"
        description="Fields shown/hidden based on current role permissions. Demonstrates role-based field hide/show."
      >
        <FieldVisibilityDemo currentRole={currentRole} />
      </Section>
    </div>
  );
}

/** Demonstrates that different roles see different form fields */
function FieldVisibilityDemo({ currentRole }: { currentRole: Role }) {
  type Field = { name: string; label: string; requiredRole: Role | null; value: string };

  const fields: Field[] = [
    { name: 'username', label: 'Username', requiredRole: null, value: 'john.doe' },
    { name: 'email', label: 'Email', requiredRole: null, value: 'john@example.com' },
    { name: 'role', label: 'Role', requiredRole: 'editor', value: 'editor' },
    { name: 'salary', label: 'Salary', requiredRole: 'admin', value: '$85,000' },
    { name: 'api_key', label: 'API Key', requiredRole: 'admin', value: 'sk-xxxx-xxxx-xxxx' },
    {
      name: 'notes',
      label: 'Internal Notes',
      requiredRole: 'editor',
      value: 'VIP customer account',
    },
  ];

  const ROLE_LEVELS: Record<Role, number> = { admin: 3, editor: 2, viewer: 1 };
  const currentLevel = ROLE_LEVELS[currentRole];

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-500 mb-3">
        Current role: <strong>{currentRole}</strong> (level {currentLevel}). Fields with higher role
        requirements are hidden or masked.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => {
          const requiredLevel = f.requiredRole ? ROLE_LEVELS[f.requiredRole] : 0;
          const visible = currentLevel >= requiredLevel;

          return (
            <div
              key={f.name}
              className={`border rounded-md px-3 py-2 ${
                visible
                  ? 'border-neutral-200 bg-white'
                  : 'border-dashed border-neutral-300 bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-600">{f.label}</label>
                {f.requiredRole && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {f.requiredRole}+
                  </span>
                )}
              </div>
              {visible ? (
                <div className="text-sm text-neutral-800">{f.value}</div>
              ) : (
                <div className="text-sm text-neutral-400 italic">
                  Hidden — requires {f.requiredRole}+ role
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. FEATURE FLAGS TAB
// ═══════════════════════════════════════════════════════════════

function FeatureFlagTab() {
  const { isAdmin } = usePermissions();
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [envFilter, setEnvFilter] = useState<string>('all');

  const toggleFlag = (key: string) => {
    if (!isAdmin) {
      toast.error('Only admins can toggle feature flags');
      return;
    }
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
    const flag = flags.find((f) => f.key === key);
    toast.success(`"${flag?.label}" ${flag?.enabled ? 'disabled' : 'enabled'}`);
  };

  const filteredFlags =
    envFilter === 'all' ? flags : flags.filter((f) => f.environment === envFilter);

  const envBadge = (env: FeatureFlag['environment']) => {
    const styles: Record<string, string> = {
      all: 'bg-green-100 text-green-700',
      dev: 'bg-purple-100 text-purple-700',
      staging: 'bg-amber-100 text-amber-700',
      production: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[env]}`}>
        {env}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-xs text-purple-700">
        <strong>Feature Flags</strong> control gradual rollout. Flags can be scoped to environments.
        When disabled, UI components check{' '}
        <code className="bg-purple-100 px-1 rounded">isEnabled(flag)</code> and hide features
        accordingly.
      </div>

      {/* Env Filter */}
      <div className="flex gap-2">
        {['all', 'dev', 'staging', 'production'].map((env) => (
          <button
            key={env}
            onClick={() => setEnvFilter(env)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors
              ${
                envFilter === env
                  ? 'bg-primary-50 border-primary-300 text-primary-700 font-medium'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
          >
            {env === 'all' ? 'All Envs' : env}
          </button>
        ))}
      </div>

      {/* Flag List */}
      <div className="space-y-2">
        {filteredFlags.map((flag) => (
          <div
            key={flag.key}
            className={`border rounded-lg px-4 py-3 flex items-center justify-between transition-all
              ${flag.enabled ? 'border-green-200 bg-green-50/50' : 'border-neutral-200 bg-white'}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-800">{flag.label}</span>
                {envBadge(flag.environment)}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{flag.description}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-400">
                <span>
                  Key: <code className="font-mono">{flag.key}</code>
                </span>
                <span>By: {flag.createdBy}</span>
              </div>
            </div>
            <button
              onClick={() => toggleFlag(flag.key)}
              disabled={!isAdmin}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${flag.enabled ? 'bg-green-500' : 'bg-neutral-300'}
                ${!isAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform
                  ${flag.enabled ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-neutral-500">
        <span>Total: {flags.length}</span>
        <span className="text-green-600">Enabled: {flags.filter((f) => f.enabled).length}</span>
        <span className="text-neutral-400">Disabled: {flags.filter((f) => !f.enabled).length}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. SYSTEM CONFIG TAB
// ═══════════════════════════════════════════════════════════════

function SystemConfigTab() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('settings.manage');
  const [settings, setSettings] = useState<SystemSetting[]>(INITIAL_SETTINGS);
  const [editedKeys, setEditedKeys] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const cats = new Map<string, SystemSetting[]>();
    for (const s of settings) {
      if (!cats.has(s.category)) cats.set(s.category, []);
      cats.get(s.category)?.push(s);
    }
    return cats;
  }, [settings]);

  const updateSetting = (key: string, value: string | number | boolean) => {
    if (!canManage) {
      toast.error('Permission denied: settings.manage required');
      return;
    }
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    setEditedKeys((prev) => new Set(prev).add(key));
  };

  const saveAll = () => {
    if (editedKeys.size === 0) {
      toast('No changes to save');
      return;
    }
    // Simulate save
    const restartNeeded = settings.some((s) => editedKeys.has(s.key) && s.requiresRestart);
    toast.success(
      `${editedKeys.size} setting(s) saved!${restartNeeded ? ' Server restart recommended.' : ''}`,
    );
    setEditedKeys(new Set());
  };

  const resetAll = () => {
    setSettings(INITIAL_SETTINGS);
    setEditedKeys(new Set());
    toast.success('Settings reset to defaults');
  };

  const renderInput = (setting: SystemSetting) => {
    const isEdited = editedKeys.has(setting.key);
    const baseClass = `border rounded-md px-3 py-1.5 text-sm w-full focus:ring-2 focus:ring-primary-500 outline-none
      disabled:bg-neutral-100 disabled:cursor-not-allowed
      ${isEdited ? 'border-primary-400 bg-primary-50/30' : 'border-neutral-300'}`;

    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            disabled={!canManage}
            className={baseClass}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => updateSetting(setting.key, Number(e.target.value))}
            disabled={!canManage}
            className={baseClass}
          />
        );
      case 'boolean':
        return (
          <button
            onClick={() => updateSetting(setting.key, !(setting.value as boolean))}
            disabled={!canManage}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200
              ${setting.value ? 'bg-primary-500' : 'bg-neutral-300'}
              ${!canManage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${setting.value ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        );
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            disabled={!canManage}
            className={baseClass}
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Save bar */}
      {editedKeys.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-primary-700">
            <strong>{editedKeys.size}</strong> unsaved change(s)
          </span>
          <div className="flex gap-2">
            <button
              onClick={resetAll}
              className="px-3 py-1 text-xs text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Reset
            </button>
            <button
              onClick={saveAll}
              className="px-3 py-1 text-xs bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Settings by category */}
      {Array.from(categories.entries()).map(([category, catSettings]) => (
        <div key={category} className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
            <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              {category}
            </h4>
          </div>
          <div className="divide-y divide-neutral-100">
            {catSettings.map((setting) => {
              const isEdited = editedKeys.has(setting.key);
              return (
                <div key={setting.key} className="px-4 py-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-800">{setting.label}</span>
                      {setting.requiresRestart && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          restart
                        </span>
                      )}
                      {isEdited && (
                        <span className="text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                          modified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{setting.description}</p>
                  </div>
                  <div className="w-56 flex-shrink-0">{renderInput(setting)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const { isAdmin, hasPermission, currentRole } = usePermissions();
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { key: 'users', label: 'Users', icon: '👤' },
    { key: 'roles', label: 'Roles & Permissions', icon: '🛡️' },
    { key: 'flags', label: 'Feature Flags', icon: '🚩' },
    {
      key: 'config',
      label: 'System Config',
      icon: '⚙️',
      locked: !hasPermission('settings.read'),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">⚙ Settings Module</h1>
        <p className="text-sm text-neutral-500 mt-1">
          User management, Role/Permission RBAC, Feature flags, and System configuration.
          Demonstrates Permission guard, Route guard, and Dynamic role-based field hide/show.
        </p>
      </div>

      {/* Architecture Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">Architecture</h3>
        <p className="text-xs text-blue-700">
          <strong>Guard chain:</strong> Request →{' '}
          <code className="bg-blue-100 px-1 rounded">JwtAuthGuard</code> →{' '}
          <code className="bg-blue-100 px-1 rounded">RolesGuard</code> → Controller.{' '}
          <strong>Frontend:</strong> <code className="bg-blue-100 px-1 rounded">PrivateRoute</code>{' '}
          (route guard) + <code className="bg-blue-100 px-1 rounded">hasPermission(key)</code> (UI
          guard) + <code className="bg-blue-100 px-1 rounded">role-based field visibility</code>.{' '}
          Current role: <strong>{currentRole}</strong> {isAdmin ? '(full access)' : '(restricted)'}.
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'users' && (
        <Section
          title="User Management"
          description="Create, edit, and manage user accounts. Actions are gated by RBAC permissions."
          badge={
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              Requires: users.*
            </span>
          }
        >
          <UserManagementTab />
        </Section>
      )}

      {activeTab === 'roles' && (
        <Section
          title="Role & Permission Matrix"
          description="RBAC configuration: 3 roles (Admin, Editor, Viewer) with granular permission toggles per module."
          badge={
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              Admin only
            </span>
          }
        >
          <RolePermissionTab />
        </Section>
      )}

      {activeTab === 'flags' && (
        <Section
          title="Feature Flags"
          description="Toggle feature rollout by environment. UI components conditionally render based on flag state."
          badge={
            <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              Environment-scoped
            </span>
          }
        >
          <FeatureFlagTab />
        </Section>
      )}

      {activeTab === 'config' && (
        <Section
          title="System Configuration"
          description="Global settings: General, Security, Email, Performance. Changes are tracked before save."
          badge={
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              settings.manage
            </span>
          }
        >
          <SystemConfigTab />
        </Section>
      )}

      {/* Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Checklist</h3>
        <ul className="text-xs text-green-700 space-y-0.5">
          <li>
            ✅ User management — Full CRUD with search, role filter, inline role edit,
            activate/deactivate
          </li>
          <li>✅ Role/Permission — RBAC matrix with 3 roles × 12 permissions, toggle per module</li>
          <li>✅ Feature flag — 6 flags with environment scoping, enable/disable toggle</li>
          <li>
            ✅ System config — 13 settings across 4 categories (General, Security, Email,
            Performance)
          </li>
          <li>✅ Permission guard — Frontend hasPermission(key) gates actions, toast on denied</li>
          <li>✅ Route guard — PrivateRoute + locked tab for insufficient permissions</li>
          <li>
            ✅ Dynamic role-based field hide/show — FieldVisibilityDemo with role-level gating
          </li>
        </ul>
      </div>
    </div>
  );
}
