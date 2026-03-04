import React, { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

// ============================================================
// ActivityLogPage — Screen 9: ACTIVITY LOG
// Enterprise audit trail:
// ✅ System audit — filterable log with user, action, entity, timestamp
// ✅ Change history — per-record change timeline with field-level diffs
// ✅ Diff viewer — side-by-side old/new value comparison
// ============================================================

// ─── Types ───────────────────────────────────────────────────

type LogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'permission_change';
type LogSeverity = 'info' | 'warning' | 'critical';

interface FieldChange {
  field: string;
  oldValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
}

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: { id: string; name: string; role: string; avatar?: string };
  action: LogAction;
  entity?: string;
  entityId?: string;
  entityLabel?: string;
  description: string;
  severity: LogSeverity;
  changes?: FieldChange[];
  metadata?: Record<string, string>;
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

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_USERS = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'John Editor', role: 'editor' },
  { id: '3', name: 'Jane Viewer', role: 'viewer' },
  { id: '4', name: 'System Bot', role: 'system' },
];

function generateMockLogs(count: number): ActivityLogEntry[] {
  const actions: LogAction[] = [
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'export',
    'permission_change',
  ];
  const entities = ['users', 'orders', 'products', 'categories', 'tags'];
  const severities: LogSeverity[] = ['info', 'info', 'info', 'warning', 'critical'];

  function getSeverity(action: LogAction, fallback: LogSeverity): LogSeverity {
    if (action === 'delete') return 'warning';
    if (action === 'permission_change') return 'critical';
    return fallback;
  }

  return Array.from({ length: count }, (_, i) => {
    const action = actions[i % actions.length];
    const user = MOCK_USERS[i % MOCK_USERS.length];
    const entity = entities[i % entities.length];
    const severity = getSeverity(action, severities[i % severities.length]);
    const timestamp = new Date(
      2026,
      2,
      4,
      10 - Math.floor(i / 3),
      59 - ((i * 7) % 60),
    ).toISOString();

    const descriptions: Record<LogAction, string> = {
      create: `Created new ${entity} record #${1000 + i}`,
      update: `Updated ${entity} record #${1000 + i}`,
      delete: `Deleted ${entity} record #${1000 + i}`,
      login: `User logged in from 192.168.1.${100 + i}`,
      logout: `User logged out`,
      export: `Exported ${entity} data (${50 + i * 10} records)`,
      permission_change: `Changed role permissions for "${entity}" module`,
    };

    let changes: FieldChange[] | undefined;
    if (action === 'update') {
      changes = [
        { field: 'status', oldValue: 'draft', newValue: 'active' },
        { field: 'name', oldValue: `Old Name ${i}`, newValue: `New Name ${i}` },
        { field: 'price', oldValue: 29.99, newValue: 39.99 },
        { field: 'updated_at', oldValue: '2026-03-03T10:00:00Z', newValue: timestamp },
      ];
    } else if (action === 'create') {
      changes = [
        { field: 'name', oldValue: null, newValue: `New Record ${i}` },
        { field: 'status', oldValue: null, newValue: 'active' },
        { field: 'created_by', oldValue: null, newValue: user.name },
      ];
    } else if (action === 'permission_change') {
      changes = [
        { field: 'read', oldValue: true, newValue: true },
        { field: 'create', oldValue: false, newValue: true },
        { field: 'delete', oldValue: true, newValue: false },
      ];
    }

    return {
      id: `log-${i}`,
      timestamp,
      user,
      action,
      entity: ['login', 'logout'].includes(action) ? undefined : entity,
      entityId: ['login', 'logout'].includes(action) ? undefined : `${1000 + i}`,
      entityLabel: ['login', 'logout'].includes(action) ? undefined : `Record #${1000 + i}`,
      description: descriptions[action],
      severity,
      changes,
      metadata: {
        ip: `192.168.1.${100 + (i % 50)}`,
        browser: i % 2 === 0 ? 'Chrome 120' : 'Firefox 115',
      },
    };
  });
}

const ALL_LOGS = generateMockLogs(50);

// ─── Action colors & icons ───────────────────────────────────

const ACTION_META: Record<LogAction, { label: string; icon: string; color: string; bg: string }> = {
  create: { label: 'Created', icon: '➕', color: 'text-green-700', bg: 'bg-green-100' },
  update: { label: 'Updated', icon: '✏️', color: 'text-blue-700', bg: 'bg-blue-100' },
  delete: { label: 'Deleted', icon: '🗑️', color: 'text-red-700', bg: 'bg-red-100' },
  login: { label: 'Login', icon: '🔐', color: 'text-purple-700', bg: 'bg-purple-100' },
  logout: { label: 'Logout', icon: '🚪', color: 'text-neutral-600', bg: 'bg-neutral-100' },
  export: { label: 'Export', icon: '📤', color: 'text-amber-700', bg: 'bg-amber-100' },
  permission_change: { label: 'Permission', icon: '🛡️', color: 'text-red-700', bg: 'bg-red-100' },
};

const SEVERITY_META: Record<LogSeverity, { label: string; dot: string; bg: string }> = {
  info: { label: 'Info', dot: 'bg-blue-400', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  warning: {
    label: 'Warning',
    dot: 'bg-amber-400',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  critical: { label: 'Critical', dot: 'bg-red-500', bg: 'bg-red-50 text-red-700 border-red-200' },
};

// ─── Diff Viewer ─────────────────────────────────────────────

function DiffViewer({ changes }: { changes: FieldChange[] }) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 bg-neutral-50 border-b border-neutral-200">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
          Field
        </div>
        <div className="px-3 py-1.5 text-[10px] font-semibold text-red-500 uppercase tracking-wider">
          Old Value
        </div>
        <div className="px-3 py-1.5 text-[10px] font-semibold text-green-500 uppercase tracking-wider">
          New Value
        </div>
      </div>
      {/* Rows */}
      {changes.map((change) => (
        <div
          key={change.field}
          className="grid grid-cols-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
        >
          <div className="px-3 py-2 text-xs font-mono text-neutral-700">{change.field}</div>
          <div className="px-3 py-2 text-xs">
            {change.oldValue === null ? (
              <span className="text-neutral-300 italic">null</span>
            ) : (
              <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono inline-block">
                {String(change.oldValue)}
              </span>
            )}
          </div>
          <div className="px-3 py-2 text-xs">
            {change.newValue === null ? (
              <span className="text-neutral-300 italic">null</span>
            ) : (
              <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-mono inline-block">
                {String(change.newValue)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Inline Diff (compact) ───────────────────────────────────

function InlineDiff({ changes }: { changes: FieldChange[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {changes.map((c) => (
        <span
          key={c.field}
          className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 bg-neutral-50 font-mono"
        >
          <span className="text-neutral-500">{c.field}:</span>{' '}
          {c.oldValue !== null && (
            <span className="text-red-500 line-through mr-0.5">{String(c.oldValue)}</span>
          )}
          <span className="text-green-600">{String(c.newValue)}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Activity Timeline ───────────────────────────────────────

function ActivityTimeline({
  logs,
  onSelectLog,
  selectedId,
}: {
  logs: ActivityLogEntry[];
  onSelectLog: (log: ActivityLogEntry) => void;
  selectedId: string | null;
}) {
  return (
    <div className="space-y-0">
      {logs.map((log, index) => {
        const meta = ACTION_META[log.action];
        const sevMeta = SEVERITY_META[log.severity];
        const isSelected = selectedId === log.id;
        const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div key={log.id} className="flex gap-3 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}
              >
                <span className="text-sm">{meta.icon}</span>
              </div>
              {index < logs.length - 1 && <div className="w-px flex-1 bg-neutral-200 my-1" />}
            </div>

            {/* Content */}
            <button
              onClick={() => onSelectLog(log)}
              className={`flex-1 text-left rounded-lg px-3 py-2.5 mb-2 transition-all
                ${
                  isSelected
                    ? 'bg-primary-50 border border-primary-200 shadow-sm'
                    : 'hover:bg-neutral-50 border border-transparent'
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                  {log.entity && (
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                      {log.entity}
                    </span>
                  )}
                  {log.severity !== 'info' && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${sevMeta.bg}`}
                    >
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${sevMeta.dot} mr-0.5`}
                      />
                      {sevMeta.label}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 shrink-0">
                  {dateStr} {timeStr}
                </div>
              </div>

              <div className="text-xs text-neutral-700 mt-0.5">{log.description}</div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-neutral-400">
                  by <strong>{log.user.name}</strong>
                </span>
                <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.5 rounded">
                  {log.user.role}
                </span>
              </div>

              {/* Inline changes preview */}
              {log.changes && !isSelected && <InlineDiff changes={log.changes.slice(0, 3)} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Log Detail Panel ────────────────────────────────────────

function LogDetailPanel({ log }: { log: ActivityLogEntry | null }) {
  if (!log) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-neutral-400 min-h-[300px]">
        Select a log entry to view details
      </div>
    );
  }

  const meta = ACTION_META[log.action];
  const sevMeta = SEVERITY_META[log.severity];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}
        >
          <span className="text-lg">{meta.icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-800">{log.description}</h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {new Date(log.timestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${sevMeta.bg}`}>
          {sevMeta.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2">
        <InfoItem label="User" value={log.user.name} />
        <InfoItem label="Role" value={log.user.role} />
        <InfoItem label="Action" value={meta.label} />
        <InfoItem label="Entity" value={log.entity ?? '—'} />
        <InfoItem label="Record ID" value={log.entityId ?? '—'} />
        <InfoItem label="Log ID" value={log.id} />
        {log.metadata &&
          Object.entries(log.metadata).map(([key, value]) => (
            <InfoItem key={key} label={key} value={value} />
          ))}
      </div>

      {/* Diff viewer */}
      {log.changes && log.changes.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Changes ({log.changes.length} fields)
          </div>
          <DiffViewer changes={log.changes} />
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded px-3 py-1.5">
      <div className="text-[9px] text-neutral-400 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-neutral-700 font-medium truncate capitalize">{value}</div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────

function StatsBar({ logs }: { logs: ActivityLogEntry[] }) {
  const stats = useMemo(() => {
    const byAction = new Map<LogAction, number>();
    const bySeverity = new Map<LogSeverity, number>();
    const byUser = new Map<string, number>();

    for (const log of logs) {
      byAction.set(log.action, (byAction.get(log.action) ?? 0) + 1);
      bySeverity.set(log.severity, (bySeverity.get(log.severity) ?? 0) + 1);
      byUser.set(log.user.name, (byUser.get(log.user.name) ?? 0) + 1);
    }

    return { byAction, bySeverity, byUser, total: logs.length };
  }, [logs]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total Events" value={stats.total} icon="📊" />
      <StatCard
        label="Warnings"
        value={stats.bySeverity.get('warning') ?? 0}
        icon="⚠️"
        color={stats.bySeverity.get('warning') ? 'text-amber-600' : undefined}
      />
      <StatCard
        label="Critical"
        value={stats.bySeverity.get('critical') ?? 0}
        icon="🔴"
        color={stats.bySeverity.get('critical') ? 'text-red-600' : undefined}
      />
      <StatCard label="Active Users" value={stats.byUser.size} icon="👤" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="border border-neutral-200 rounded-lg px-4 py-3 bg-white">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className={`text-xl font-bold ${color ?? 'text-neutral-800'}`}>{value}</span>
      </div>
      <div className="text-[10px] text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}

// ─── Filter Bar ──────────────────────────────────────────────

function FilterBar({
  actionFilter,
  onActionFilter,
  severityFilter,
  onSeverityFilter,
  searchQuery,
  onSearchQuery,
}: {
  actionFilter: LogAction | null;
  onActionFilter: (a: LogAction | null) => void;
  severityFilter: LogSeverity | null;
  onSeverityFilter: (s: LogSeverity | null) => void;
  searchQuery: string;
  onSearchQuery: (q: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 border border-neutral-200 rounded-md px-3 py-1.5 w-64">
        <span className="text-neutral-400 text-sm">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQuery(e.target.value)}
          placeholder="Search logs..."
          className="flex-1 bg-transparent text-xs outline-none text-neutral-700 placeholder-neutral-400"
        />
      </div>

      {/* Action filters */}
      <div className="flex gap-1">
        <button
          onClick={() => onActionFilter(null)}
          className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors
            ${!actionFilter ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
        >
          All
        </button>
        {(Object.keys(ACTION_META) as LogAction[]).map((action) => {
          const meta = ACTION_META[action];
          return (
            <button
              key={action}
              onClick={() => onActionFilter(actionFilter === action ? null : action)}
              className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors
                ${actionFilter === action ? 'bg-neutral-800 text-white' : `${meta.bg} ${meta.color} hover:opacity-80`}`}
            >
              {meta.icon} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Severity */}
      <div className="flex gap-1 ml-auto">
        {(Object.keys(SEVERITY_META) as LogSeverity[]).map((severity) => {
          const meta = SEVERITY_META[severity];
          return (
            <button
              key={severity}
              onClick={() => onSeverityFilter(severityFilter === severity ? null : severity)}
              className={`text-[10px] px-2 py-1 rounded-md font-medium border transition-colors
                ${
                  severityFilter === severity
                    ? 'bg-neutral-800 text-white border-neutral-800'
                    : `${meta.bg}`
                }`}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot} mr-1`} />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Change History (per-record timeline) ────────────────────

function ChangeHistoryPanel() {
  // Simulate a record's change history
  const history = useMemo<ActivityLogEntry[]>(
    () => [
      {
        id: 'hist-1',
        timestamp: '2026-03-04T10:30:00Z',
        user: MOCK_USERS[0],
        action: 'update',
        entity: 'products',
        entityId: '1042',
        entityLabel: 'Product #1042',
        description: 'Updated product pricing and status',
        severity: 'info',
        changes: [
          { field: 'price', oldValue: 29.99, newValue: 39.99 },
          { field: 'status', oldValue: 'draft', newValue: 'active' },
          {
            field: 'updated_at',
            oldValue: '2026-03-03T08:00:00Z',
            newValue: '2026-03-04T10:30:00Z',
          },
        ],
      },
      {
        id: 'hist-2',
        timestamp: '2026-03-03T08:15:00Z',
        user: MOCK_USERS[1],
        action: 'update',
        entity: 'products',
        entityId: '1042',
        entityLabel: 'Product #1042',
        description: 'Added product description',
        severity: 'info',
        changes: [
          {
            field: 'description',
            oldValue: '',
            newValue: 'Premium wireless headphones with noise cancellation',
          },
          { field: 'category_id', oldValue: null, newValue: 'electronics' },
        ],
      },
      {
        id: 'hist-3',
        timestamp: '2026-03-02T14:00:00Z',
        user: MOCK_USERS[0],
        action: 'create',
        entity: 'products',
        entityId: '1042',
        entityLabel: 'Product #1042',
        description: 'Created product record',
        severity: 'info',
        changes: [
          { field: 'name', oldValue: null, newValue: 'Wireless Headphones Pro' },
          { field: 'price', oldValue: null, newValue: 29.99 },
          { field: 'status', oldValue: null, newValue: 'draft' },
          { field: 'sku', oldValue: null, newValue: 'WHP-042' },
        ],
      },
    ],
    [],
  );

  const [selectedHist, setSelectedHist] = useState<string | null>(history[0].id);
  const selectedLog = history.find((h) => h.id === selectedHist) ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Record info */}
      <div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
          <div className="text-xs font-semibold text-blue-800">
            📦 Product #1042 — Wireless Headphones Pro
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">
            3 revisions · Last updated Mar 4, 2026
          </div>
        </div>

        <div className="space-y-0">
          {history.map((log, index) => {
            const meta = ACTION_META[log.action];
            const isSelected = selectedHist === log.id;
            return (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${meta.bg}`}
                  >
                    {meta.icon}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-px flex-1 bg-neutral-200 my-1" />
                  )}
                </div>
                <button
                  onClick={() => setSelectedHist(log.id)}
                  className={`flex-1 text-left rounded-lg px-3 py-2 mb-1.5 transition-all
                    ${isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-neutral-50 border border-transparent'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${meta.color}`}>{meta.label}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(log.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">{log.description}</div>
                  <div className="text-[10px] text-neutral-400">by {log.user.name}</div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diff for selected revision */}
      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
        {selectedLog ? (
          <div>
            <h4 className="text-xs font-semibold text-neutral-700 mb-3">
              Changes in revision — {new Date(selectedLog.timestamp).toLocaleString()}
            </h4>
            {selectedLog.changes && <DiffViewer changes={selectedLog.changes} />}
          </div>
        ) : (
          <div className="text-center text-sm text-neutral-400 py-8">Select a revision</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ActivityLogPage() {
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const [actionFilter, setActionFilter] = useState<LogAction | null>(null);
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'audit' | 'history' | 'diff'>('audit');

  // Filter logs
  const filteredLogs = useMemo(() => {
    let logs = ALL_LOGS;
    if (actionFilter) logs = logs.filter((l) => l.action === actionFilter);
    if (severityFilter) logs = logs.filter((l) => l.severity === severityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          l.user.name.toLowerCase().includes(q) ||
          (l.entity?.toLowerCase().includes(q) ?? false),
      );
    }
    return logs;
  }, [actionFilter, severityFilter, searchQuery]);

  const handleExportLogs = useCallback(() => {
    const csv = [
      'ID,Timestamp,User,Role,Action,Entity,Description,Severity',
      ...filteredLogs.map(
        (l) =>
          `${l.id},${l.timestamp},${l.user.name},${l.user.role},${l.action},${l.entity ?? ''},${l.description},${l.severity}`,
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Activity log exported');
  }, [filteredLogs]);

  const tabs = [
    { key: 'audit' as const, label: 'System Audit', icon: '📋' },
    { key: 'history' as const, label: 'Change History', icon: '📜' },
    { key: 'diff' as const, label: 'Diff Viewer', icon: '🔀' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">📋 Activity Log</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Enterprise audit trail — System audit with filterable timeline, per-record change history,
          and field-level diff viewer.
        </p>
      </div>

      {/* Architecture */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">Architecture</h3>
        <p className="text-xs text-blue-700">
          Every mutation (create/update/delete) generates an{' '}
          <code className="bg-blue-100 px-1 rounded">ActivityLogEntry</code> with user, action,
          entity, field-level <code className="bg-blue-100 px-1 rounded">FieldChange[]</code> diffs,
          severity classification, and metadata (IP, browser). Backend:{' '}
          <code className="bg-blue-100 px-1 rounded">@AuditLog()</code> decorator auto-captures
          changes.
        </p>
      </div>

      {/* Stats */}
      <StatsBar logs={ALL_LOGS} />

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
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

      {/* Tab: System Audit */}
      {activeTab === 'audit' && (
        <Section
          title="System Audit Trail"
          description="Filterable timeline of all system events with severity classification."
          badge={
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                {filteredLogs.length} / {ALL_LOGS.length} events
              </span>
              <button
                onClick={handleExportLogs}
                className="text-[10px] bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full hover:bg-neutral-50 transition-colors"
              >
                📤 Export CSV
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <FilterBar
              actionFilter={actionFilter}
              onActionFilter={setActionFilter}
              severityFilter={severityFilter}
              onSeverityFilter={setSeverityFilter}
              searchQuery={searchQuery}
              onSearchQuery={setSearchQuery}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Timeline */}
              <div className="lg:col-span-3 max-h-[600px] overflow-y-auto pr-1">
                <ActivityTimeline
                  logs={filteredLogs}
                  onSelectLog={setSelectedLog}
                  selectedId={selectedLog?.id ?? null}
                />
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-2 border border-neutral-200 rounded-lg p-4 bg-neutral-50 sticky top-0">
                <LogDetailPanel log={selectedLog} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Tab: Change History */}
      {activeTab === 'history' && (
        <Section
          title="Record Change History"
          description="Per-record revision timeline. Example: Product #1042 with 3 revisions showing field-level diffs."
        >
          <ChangeHistoryPanel />
        </Section>
      )}

      {/* Tab: Diff Viewer */}
      {activeTab === 'diff' && (
        <Section
          title="Diff Viewer"
          description="Side-by-side old/new value comparison for any change set."
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              Showing a sample diff for an <strong>update</strong> operation with multiple field
              changes.
            </div>
            <DiffViewer
              changes={[
                {
                  field: 'name',
                  oldValue: 'Wireless Headphones',
                  newValue: 'Wireless Headphones Pro',
                },
                { field: 'price', oldValue: 29.99, newValue: 39.99 },
                { field: 'status', oldValue: 'draft', newValue: 'active' },
                {
                  field: 'description',
                  oldValue: '',
                  newValue: 'Premium wireless headphones with ANC',
                },
                { field: 'stock', oldValue: 100, newValue: 250 },
                { field: 'is_featured', oldValue: false, newValue: true },
                { field: 'category', oldValue: null, newValue: 'electronics' },
                { field: 'tags', oldValue: 'audio', newValue: 'audio, premium, wireless' },
                {
                  field: 'updated_at',
                  oldValue: '2026-03-03T08:00:00Z',
                  newValue: '2026-03-04T10:30:00Z',
                },
              ]}
            />

            <div className="text-[10px] text-neutral-500 text-center mt-2">
              9 fields changed · Click any row in System Audit to see its diff
            </div>
          </div>
        </Section>
      )}

      {/* Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Checklist</h3>
        <ul className="text-xs text-green-700 space-y-0.5">
          <li>
            ✅ System audit — Filterable timeline with 7 action types, 3 severity levels, search,
            export CSV
          </li>
          <li>
            ✅ Change history — Per-record revision timeline with field-level diffs (Product #1042
            example)
          </li>
          <li>
            ✅ Diff viewer — Side-by-side old/new value comparison, red/green highlighting, null
            handling
          </li>
          <li>✅ Stats bar — Total events, warnings, critical alerts, unique users overview</li>
          <li>✅ Export — CSV export of filtered activity log</li>
        </ul>
      </div>
    </div>
  );
}
