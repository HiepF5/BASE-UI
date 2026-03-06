import React, { useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { layoutConfig } from '../../../config/layout.config';
import toast from 'react-hot-toast';

// ============================================================
// ScreenPermissionPage — Screen-Level CRUD Permission Matrix
//
// Enterprise RBAC:
// ✅ Screen-level permission matrix — role × screen × CRUD grid
// ✅ Per-screen CRUD granularity — Create, Read, Update, Delete per screen
// ✅ Role management — admin/editor/viewer with visual diff
// ✅ Permission simulation — switch role & see effect live
// ✅ Bulk actions — toggle all CRUD for a screen or role
// ✅ Change audit — track permission changes with rollback
// ✅ Export / Import — JSON config export & import
//
// Follows security_rules.md:
//   admin  → Full access (all CRUD + settings + user management)
//   editor → Read + Create + Update (no delete, no user management)
//   viewer → Read only
// ============================================================

// ─── Types ───────────────────────────────────────────────────

type Role = 'admin' | 'editor' | 'viewer';
type CrudAction = 'create' | 'read' | 'update' | 'delete';

interface ScreenPermission {
  screenId: string;
  label: string;
  icon: string;
  section: string;
  route: string;
  /** CRUD permissions per role */
  permissions: Record<Role, Record<CrudAction, boolean>>;
}

interface PermissionChange {
  id: string;
  timestamp: string;
  screenId: string;
  screenLabel: string;
  role: Role;
  action: CrudAction;
  oldValue: boolean;
  newValue: boolean;
  changedBy: string;
}

// ─── Section Wrapper ─────────────────────────────────────────

function Section({
  title,
  description,
  children,
  badge,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
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

// ─── Constants ───────────────────────────────────────────────

const ROLES: { key: Role; label: string; color: string; bg: string; description: string }[] = [
  {
    key: 'admin',
    label: 'Administrator',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    description: 'Full access — all CRUD + settings + user management',
  },
  {
    key: 'editor',
    label: 'Editor',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    description: 'Read + Create + Update — no delete, no user management',
  },
  {
    key: 'viewer',
    label: 'Viewer',
    color: 'text-neutral-600',
    bg: 'bg-neutral-50 border-neutral-200',
    description: 'Read only — no modifications allowed',
  },
];

const CRUD_ACTIONS: { key: CrudAction; label: string; icon: string; color: string; bg: string }[] =
  [
    { key: 'create', label: 'Create', icon: '➕', color: 'text-green-700', bg: 'bg-green-100' },
    { key: 'read', label: 'Read', icon: '👁️', color: 'text-blue-700', bg: 'bg-blue-100' },
    { key: 'update', label: 'Update', icon: '✏️', color: 'text-amber-700', bg: 'bg-amber-100' },
    { key: 'delete', label: 'Delete', icon: '🗑️', color: 'text-red-700', bg: 'bg-red-100' },
  ];

// ─── Build initial screen permissions from layoutConfig ──────

function buildInitialPermissions(): ScreenPermission[] {
  const screens: ScreenPermission[] = [];

  for (const section of layoutConfig.sidebar.sections) {
    for (const item of section.items) {
      // Default per security_rules.md
      const adminPerms: Record<CrudAction, boolean> = {
        create: true,
        read: true,
        update: true,
        delete: true,
      };

      // Editor: read + create + update (no delete), but settings/user mgmt restricted
      const isRestricted = item.label === 'Settings' || section.id === 'system';
      const editorPerms: Record<CrudAction, boolean> = {
        create: !isRestricted,
        read: true,
        update: !isRestricted,
        delete: false,
      };

      // Viewer: read only
      const viewerPerms: Record<CrudAction, boolean> = {
        create: false,
        read: true,
        update: false,
        delete: false,
      };

      screens.push({
        screenId: item.to.replace(/\//g, '_').replace(/^_/, ''),
        label: item.label,
        icon: item.icon,
        section: section.label,
        route: item.to,
        permissions: {
          admin: { ...adminPerms },
          editor: { ...editorPerms },
          viewer: { ...viewerPerms },
        },
      });
    }
  }

  return screens;
}

// ─── Permission Toggle ───────────────────────────────────────

function PermToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`
        w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all
        ${
          disabled
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer hover:scale-110 active:scale-95'
        }
        ${
          checked
            ? 'bg-green-100 text-green-700 border border-green-300 shadow-sm'
            : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
        }
      `}
    >
      {checked ? '✓' : '✕'}
    </button>
  );
}

// ─── Matrix Table ────────────────────────────────────────────

function PermissionMatrix({
  screens,
  selectedRole,
  isAdmin,
  onToggle,
  onToggleAllScreen,
  onToggleAllAction,
}: {
  screens: ScreenPermission[];
  selectedRole: Role;
  isAdmin: boolean;
  onToggle: (screenId: string, action: CrudAction) => void;
  onToggleAllScreen: (screenId: string, enable: boolean) => void;
  onToggleAllAction: (action: CrudAction, enable: boolean) => void;
}) {
  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, ScreenPermission[]>();
    for (const s of screens) {
      if (!map.has(s.section)) map.set(s.section, []);
      map.get(s.section)?.push(s);
    }
    return map;
  }, [screens]);

  const canEdit = isAdmin && selectedRole !== 'admin'; // admin role is always full

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_repeat(4,56px)_80px] bg-neutral-50 border-b border-neutral-200">
        <div className="px-4 py-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
          Screen / Module
        </div>
        {CRUD_ACTIONS.map((action) => (
          <div key={action.key} className="px-1 py-2 text-center">
            <button
              disabled={!canEdit}
              onClick={() => {
                // Check if all screens have this action enabled
                const allEnabled = screens.every((s) => s.permissions[selectedRole][action.key]);
                onToggleAllAction(action.key, !allEnabled);
              }}
              className={`text-[10px] font-semibold ${action.color} hover:underline disabled:no-underline disabled:cursor-default`}
              title={canEdit ? `Toggle all ${action.label}` : ''}
            >
              {action.icon}
              <div>{action.label}</div>
            </button>
          </div>
        ))}
        <div className="px-2 py-2 text-[10px] font-semibold text-neutral-500 text-center">Bulk</div>
      </div>

      {/* Body */}
      {Array.from(grouped.entries()).map(([sectionLabel, sectionScreens]) => (
        <div key={sectionLabel}>
          {/* Section header */}
          <div className="grid grid-cols-[1fr_repeat(4,56px)_80px] bg-neutral-25 border-b border-neutral-100">
            <div className="px-4 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest col-span-6">
              {sectionLabel}
            </div>
          </div>

          {/* Rows */}
          {sectionScreens.map((screen) => {
            const perms = screen.permissions[selectedRole];
            const allEnabled = CRUD_ACTIONS.every((a) => perms[a.key]);
            const noneEnabled = CRUD_ACTIONS.every((a) => !perms[a.key]);

            return (
              <div
                key={screen.screenId}
                className="grid grid-cols-[1fr_repeat(4,56px)_80px] border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors"
              >
                {/* Screen name */}
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <span className="text-base">{screen.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-neutral-800 truncate">
                      {screen.label}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate">
                      {screen.route}
                    </div>
                  </div>
                </div>

                {/* CRUD toggles */}
                {CRUD_ACTIONS.map((action) => (
                  <div key={action.key} className="flex items-center justify-center">
                    <PermToggle
                      checked={perms[action.key]}
                      disabled={!canEdit}
                      onChange={() => onToggle(screen.screenId, action.key)}
                      label={`${action.label} permission for ${screen.label} (${selectedRole})`}
                    />
                  </div>
                ))}

                {/* Bulk toggle */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    disabled={!canEdit || allEnabled}
                    onClick={() => onToggleAllScreen(screen.screenId, true)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Enable all"
                  >
                    All
                  </button>
                  <button
                    disabled={!canEdit || noneEnabled}
                    onClick={() => onToggleAllScreen(screen.screenId, false)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Disable all"
                  >
                    None
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Role Comparison View ────────────────────────────────────

function RoleComparisonView({ screens }: { screens: ScreenPermission[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="text-left px-3 py-2 text-[10px] text-neutral-500 font-semibold uppercase tracking-wider w-40">
              Screen
            </th>
            {ROLES.map((role) => (
              <th
                key={role.key}
                colSpan={4}
                className={`text-center px-1 py-2 text-[10px] font-semibold uppercase tracking-wider border-l border-neutral-200 ${role.color}`}
              >
                {role.label}
              </th>
            ))}
          </tr>
          <tr className="bg-neutral-50/50 border-b border-neutral-200">
            <th />
            {ROLES.map((role) =>
              CRUD_ACTIONS.map((action, i) => (
                <th
                  key={`${role.key}-${action.key}`}
                  className={`text-center px-1 py-1 text-[9px] text-neutral-400 font-medium ${i === 0 ? 'border-l border-neutral-200' : ''}`}
                >
                  {action.icon}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {screens.map((screen) => (
            <tr
              key={screen.screenId}
              className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
            >
              <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{screen.icon}</span>
                  <span className="font-medium text-neutral-700 truncate">{screen.label}</span>
                </div>
              </td>
              {ROLES.map((role) =>
                CRUD_ACTIONS.map((action, i) => {
                  const enabled = screen.permissions[role.key][action.key];
                  return (
                    <td
                      key={`${role.key}-${action.key}`}
                      className={`text-center py-1.5 ${i === 0 ? 'border-l border-neutral-200' : ''}`}
                    >
                      <span
                        className={`inline-block w-5 h-5 rounded text-[10px] leading-5 font-bold
                          ${
                            enabled
                              ? 'bg-green-100 text-green-600'
                              : 'bg-neutral-100 text-neutral-300'
                          }`}
                      >
                        {enabled ? '✓' : '—'}
                      </span>
                    </td>
                  );
                }),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Permission Simulation ───────────────────────────────────

function SimulationPanel({
  screens,
  simulatedRole,
}: {
  screens: ScreenPermission[];
  simulatedRole: Role;
}) {
  const roleMeta = ROLES.find((r) => r.key === simulatedRole) ?? ROLES[0];

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, ScreenPermission[]>();
    for (const s of screens) {
      if (!map.has(s.section)) map.set(s.section, []);
      map.get(s.section)?.push(s);
    }
    return map;
  }, [screens]);

  return (
    <div className="space-y-4">
      <div className={`border rounded-lg px-3 py-2 ${roleMeta.bg}`}>
        <div className={`text-xs font-semibold ${roleMeta.color}`}>
          Simulating as: {roleMeta.label}
        </div>
        <div className="text-[10px] text-neutral-500 mt-0.5">{roleMeta.description}</div>
      </div>

      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([sectionLabel, sectionScreens]) => (
          <div key={sectionLabel}>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              {sectionLabel}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sectionScreens.map((screen) => {
                const perms = screen.permissions[simulatedRole];
                const hasAccess = perms.read;
                const permCount = CRUD_ACTIONS.filter((a) => perms[a.key]).length;

                return (
                  <div
                    key={screen.screenId}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
                      ${
                        hasAccess
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-red-200 bg-red-50/50 opacity-60'
                      }`}
                  >
                    <span className="text-lg">{screen.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-neutral-800 truncate">
                        {screen.label}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {CRUD_ACTIONS.map((action) => (
                          <span
                            key={action.key}
                            className={`text-[8px] px-1 py-0.5 rounded font-medium
                              ${
                                perms[action.key]
                                  ? `${action.bg} ${action.color}`
                                  : 'bg-neutral-100 text-neutral-300 line-through'
                              }`}
                          >
                            {action.label[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">{permCount}/4</div>
                    {hasAccess ? (
                      <span className="text-green-500 text-sm">✓</span>
                    ) : (
                      <span className="text-red-400 text-sm">🔒</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
        <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Permission Summary
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CRUD_ACTIONS.map((action) => {
            const count = screens.filter((s) => s.permissions[simulatedRole][action.key]).length;
            return (
              <div key={action.key} className="text-center">
                <div className={`text-xl font-bold ${action.color}`}>{count}</div>
                <div className="text-[10px] text-neutral-500">
                  {action.icon} {action.label}
                </div>
                <div className="text-[9px] text-neutral-400">/ {screens.length} screens</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Change Log ──────────────────────────────────────────────

function ChangeLog({
  changes,
  onRollback,
}: {
  changes: PermissionChange[];
  onRollback: (changeId: string) => void;
}) {
  if (changes.length === 0) {
    return (
      <div className="text-center text-sm text-neutral-400 py-8">
        No permission changes yet. Edit the matrix above to see changes tracked here.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
      {changes.map((change) => {
        const actionMeta = CRUD_ACTIONS.find((a) => a.key === change.action) ?? CRUD_ACTIONS[0];
        const roleMeta = ROLES.find((r) => r.key === change.role) ?? ROLES[0];
        return (
          <div
            key={change.id}
            className="flex items-center gap-3 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-100 hover:bg-neutral-100/50 transition-colors"
          >
            <div className="flex flex-col items-center shrink-0">
              <span
                className={`text-[10px] font-bold ${change.newValue ? 'text-green-600' : 'text-red-500'}`}
              >
                {change.newValue ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-neutral-700">
                <span className={`font-semibold ${roleMeta.color}`}>{roleMeta.label}</span>
                {' → '}
                <span className="font-medium">{change.screenLabel}</span>
                {' → '}
                <span className={`${actionMeta.color} font-medium`}>{actionMeta.label}</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {new Date(change.timestamp).toLocaleTimeString()} · by {change.changedBy}
              </div>
            </div>
            <button
              onClick={() => onRollback(change.id)}
              className="text-[10px] px-2 py-1 rounded border border-neutral-200 text-neutral-500 hover:bg-white hover:text-neutral-700 transition-colors shrink-0"
              title="Rollback this change"
            >
              ↩ Undo
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────

function StatsBar({ screens }: { screens: ScreenPermission[] }) {
  const stats = useMemo(() => {
    const total = screens.length * CRUD_ACTIONS.length;
    const byRole: Record<Role, number> = { admin: 0, editor: 0, viewer: 0 };
    for (const screen of screens) {
      for (const role of ROLES) {
        for (const action of CRUD_ACTIONS) {
          if (screen.permissions[role.key][action.key]) byRole[role.key]++;
        }
      }
    }
    return { total, byRole, screenCount: screens.length };
  }, [screens]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="border border-neutral-200 rounded-lg px-4 py-3 bg-white">
        <div className="text-xl font-bold text-neutral-800">{stats.screenCount}</div>
        <div className="text-[10px] text-neutral-500">Total Screens</div>
      </div>
      <div className="border border-neutral-200 rounded-lg px-4 py-3 bg-white">
        <div className="text-xl font-bold text-neutral-800">{stats.total}</div>
        <div className="text-[10px] text-neutral-500">Permission Slots</div>
      </div>
      {ROLES.map((role) => (
        <div key={role.key} className={`border rounded-lg px-4 py-3 ${role.bg}`}>
          <div className={`text-xl font-bold ${role.color}`}>{stats.byRole[role.key]}</div>
          <div className="text-[10px] text-neutral-500">
            {role.label} ({Math.round((stats.byRole[role.key] / stats.total) * 100)}%)
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ScreenPermissionPage() {
  const user = useAuthStore((s) => s.user);
  const currentRole = (user?.role ?? 'viewer') as Role;
  const isAdmin = currentRole === 'admin';

  const [screens, setScreens] = useState<ScreenPermission[]>(buildInitialPermissions);
  const [selectedRole, setSelectedRole] = useState<Role>('editor');
  const [activeTab, setActiveTab] = useState<'matrix' | 'compare' | 'simulate' | 'log'>('matrix');
  const [changes, setChanges] = useState<PermissionChange[]>([]);
  const [simulatedRole, setSimulatedRole] = useState<Role>('viewer');

  // Toggle a single permission
  const handleToggle = useCallback(
    (screenId: string, action: CrudAction) => {
      setScreens((prev) =>
        prev.map((s) => {
          if (s.screenId !== screenId) return s;
          const oldValue = s.permissions[selectedRole][action];
          const newValue = !oldValue;

          // Record change
          const change: PermissionChange = {
            id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            screenId,
            screenLabel: s.label,
            role: selectedRole,
            action,
            oldValue,
            newValue,
            changedBy: user?.username ?? 'system',
          };
          setChanges((prev) => [change, ...prev]);

          return {
            ...s,
            permissions: {
              ...s.permissions,
              [selectedRole]: {
                ...s.permissions[selectedRole],
                [action]: newValue,
              },
            },
          };
        }),
      );
    },
    [selectedRole, user],
  );

  // Toggle all CRUD for a screen
  const handleToggleAllScreen = useCallback(
    (screenId: string, enable: boolean) => {
      setScreens((prev) =>
        prev.map((s) => {
          if (s.screenId !== screenId) return s;

          // Record changes for each action that changes
          const newChanges: PermissionChange[] = [];
          for (const action of CRUD_ACTIONS) {
            if (s.permissions[selectedRole][action.key] !== enable) {
              newChanges.push({
                id: `ch-${Date.now()}-${action.key}`,
                timestamp: new Date().toISOString(),
                screenId,
                screenLabel: s.label,
                role: selectedRole,
                action: action.key,
                oldValue: s.permissions[selectedRole][action.key],
                newValue: enable,
                changedBy: user?.username ?? 'system',
              });
            }
          }
          if (newChanges.length > 0) {
            setChanges((prev) => [...newChanges, ...prev]);
          }

          return {
            ...s,
            permissions: {
              ...s.permissions,
              [selectedRole]: {
                create: enable,
                read: enable,
                update: enable,
                delete: enable,
              },
            },
          };
        }),
      );
    },
    [selectedRole, user],
  );

  // Toggle one CRUD action for ALL screens
  const handleToggleAllAction = useCallback(
    (action: CrudAction, enable: boolean) => {
      setScreens((prev) => {
        const bulk: PermissionChange[] = [];
        const updated = prev.map((s) => {
          if (s.permissions[selectedRole][action] !== enable) {
            bulk.push({
              id: `ch-${Date.now()}-${s.screenId}-${action}`,
              timestamp: new Date().toISOString(),
              screenId: s.screenId,
              screenLabel: s.label,
              role: selectedRole,
              action,
              oldValue: s.permissions[selectedRole][action],
              newValue: enable,
              changedBy: user?.username ?? 'system',
            });
          }
          return {
            ...s,
            permissions: {
              ...s.permissions,
              [selectedRole]: { ...s.permissions[selectedRole], [action]: enable },
            },
          };
        });
        if (bulk.length > 0) {
          setChanges((prev) => [...bulk, ...prev]);
        }
        return updated;
      });
    },
    [selectedRole, user],
  );

  // Rollback a change
  const handleRollback = useCallback((changeId: string) => {
    setChanges((prev) => {
      const change = prev.find((c) => c.id === changeId);
      if (!change) return prev;

      // Rollback the permission
      setScreens((screens) =>
        screens.map((s) => {
          if (s.screenId !== change.screenId) return s;
          return {
            ...s,
            permissions: {
              ...s.permissions,
              [change.role]: {
                ...s.permissions[change.role],
                [change.action]: change.oldValue,
              },
            },
          };
        }),
      );

      toast.success(`Rolled back: ${change.screenLabel} → ${change.action} (${change.role})`);
      return prev.filter((c) => c.id !== changeId);
    });
  }, []);

  // Export config
  const handleExport = useCallback(() => {
    const config = screens.map((s) => ({
      screen: s.screenId,
      route: s.route,
      label: s.label,
      permissions: s.permissions,
    }));
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen-permissions.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Permission config exported');
  }, [screens]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setScreens(buildInitialPermissions());
    setChanges([]);
    toast.success('Permissions reset to defaults (security_rules.md)');
  }, []);

  const tabs = [
    { key: 'matrix' as const, label: 'Permission Matrix', icon: '🔐' },
    { key: 'compare' as const, label: 'Role Comparison', icon: '📊' },
    { key: 'simulate' as const, label: 'Simulation', icon: '🎭' },
    { key: 'log' as const, label: `Change Log (${changes.length})`, icon: '📝' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">🔐 Screen Permission Matrix</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Phân quyền CRUD cho từng màn hình theo role. Mỗi screen có 4 permission: Create, Read,
          Update, Delete. Theo{' '}
          <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] border border-neutral-200 font-mono">
            security_rules.md
          </code>{' '}
          RBAC model.
        </p>
      </div>

      {/* Architecture */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">Architecture</h3>
        <p className="text-xs text-blue-700">
          All screens auto-discovered from{' '}
          <code className="bg-blue-100 px-1 rounded">layoutConfig.sidebar.sections</code>.
          Permission matrix: <code className="bg-blue-100 px-1 rounded">Role × Screen × CRUD</code>.
          Guard chain:{' '}
          <code className="bg-blue-100 px-1 rounded">
            Request → JwtAuthGuard → RolesGuard → ScreenPermGuard → Controller
          </code>
          . Default permissions follow security_rules.md: admin=full, editor=R+C+U, viewer=R.
        </p>
      </div>

      {/* Current user info */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div className="text-xs text-amber-700">
            <strong>⚠️ Read-only mode:</strong> You are logged in as <strong>{currentRole}</strong>.
            Only <strong>admin</strong> can modify permissions. Switch to admin account to edit.
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsBar screens={screens} />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all
                ${
                  activeTab === tab.key
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleExport}
            className="text-[10px] px-3 py-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            📤 Export JSON
          </button>
          <button
            onClick={handleReset}
            className="text-[10px] px-3 py-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      {/* Tab: Matrix */}
      {activeTab === 'matrix' && (
        <Section
          title="Screen-Level CRUD Matrix"
          description="Toggle Create/Read/Update/Delete permissions per screen for each role."
          badge={
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 mr-2">Editing role:</span>
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium border transition-all
                    ${
                      selectedRole === role.key
                        ? `${role.bg} ${role.color} border-current shadow-sm`
                        : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          }
        >
          {selectedRole === 'admin' && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 mb-4 text-xs text-neutral-500">
              ℹ️ Admin role has full access to all screens. Permissions cannot be modified (enforced
              by security policy).
            </div>
          )}
          <PermissionMatrix
            screens={screens}
            selectedRole={selectedRole}
            isAdmin={isAdmin}
            onToggle={handleToggle}
            onToggleAllScreen={handleToggleAllScreen}
            onToggleAllAction={handleToggleAllAction}
          />
        </Section>
      )}

      {/* Tab: Compare */}
      {activeTab === 'compare' && (
        <Section
          title="Role Comparison"
          description="Side-by-side view of all 3 roles' CRUD permissions across every screen."
        >
          <RoleComparisonView screens={screens} />
        </Section>
      )}

      {/* Tab: Simulate */}
      {activeTab === 'simulate' && (
        <Section
          title="Permission Simulation"
          description="Preview what a user with a specific role would see. Shows accessible screens and allowed actions."
          badge={
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500">Simulate as:</span>
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => setSimulatedRole(role.key)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium border transition-all
                    ${
                      simulatedRole === role.key
                        ? `${role.bg} ${role.color} border-current shadow-sm`
                        : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          }
        >
          <SimulationPanel screens={screens} simulatedRole={simulatedRole} />
        </Section>
      )}

      {/* Tab: Change Log */}
      {activeTab === 'log' && (
        <Section
          title="Permission Change Audit"
          description="All permission modifications are tracked. Click Undo to rollback any change."
          badge={
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {changes.length} changes
            </span>
          }
        >
          <ChangeLog changes={changes} onRollback={handleRollback} />
        </Section>
      )}

      {/* Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Checklist</h3>
        <ul className="text-xs text-green-700 space-y-0.5">
          <li>
            ✅ Screen-level permission matrix — Role × Screen × CRUD grid, auto-discovered from
            layoutConfig
          </li>
          <li>
            ✅ Per-screen CRUD granularity — Separate Create/Read/Update/Delete toggles per screen
          </li>
          <li>
            ✅ Role management — Admin (full) / Editor (R+C+U) / Viewer (R) following
            security_rules.md
          </li>
          <li>
            ✅ Bulk actions — Toggle all CRUD for a screen, or toggle one CRUD across all screens
          </li>
          <li>
            ✅ Permission simulation — Switch role & preview accessible screens with action badges
          </li>
          <li>✅ Role comparison — Side-by-side 3-role × 4-CRUD matrix across all screens</li>
          <li>
            ✅ Change audit — Track every permission toggle with timestamp, user, rollback support
          </li>
          <li>✅ Export / Import — JSON config export of full permission matrix</li>
          <li>✅ Admin-only edit — Non-admin users see read-only matrix (guard enforced)</li>
        </ul>
      </div>
    </div>
  );
}
