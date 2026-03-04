import React, { useMemo, useState, useCallback } from 'react';
import { LayoutDashboard, RefreshCw, Code2, ChevronDown } from 'lucide-react';
import { cn } from '../../core/utils';
import { WidgetEngine, type DashboardConfig, type WidgetData } from './widgets';
import { dashboardConfig, mockDataMap } from './dashboard.config';

// ============================================================
// DashboardPage - Dynamic Analytics Screen
// ============================================================
// Blueprint: Widget engine + Layout grid + API binding
// Config-driven via dashboardConfig → WidgetEngine renders all
// ============================================================

export function DashboardPage() {
  const [showConfig, setShowConfig] = useState(false);

  // ── Widget data (mock for now, will bind to API later) ────
  // In production: each widget's `api` field → useQuery()
  const dataMap = useMemo<Record<string, WidgetData>>(() => {
    return { ...mockDataMap };
  }, []);

  const handleRefresh = useCallback(() => {
    // In production: invalidate all widget queries
    window.location.reload();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-50">
            <LayoutDashboard className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{dashboardConfig.title}</h1>
            <p className="text-sm text-neutral-500">{dashboardConfig.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Config preview toggle */}
          <button
            onClick={() => setShowConfig((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
              showConfig
                ? 'bg-primary-50 text-primary-700 border-primary-200'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50',
            )}
          >
            <Code2 className="h-4 w-4" />
            Config
            <ChevronDown
              className={cn('h-3 w-3 transition-transform', showConfig && 'rotate-180')}
            />
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Config Preview Panel ─────────────────────────── */}
      {showConfig && <ConfigPreview config={dashboardConfig} />}

      {/* ── Widget Engine (Config-driven grid) ───────────── */}
      <WidgetEngine config={dashboardConfig} dataMap={dataMap} />
    </div>
  );
}

// ── Config Preview Component ────────────────────────────────

function ConfigPreview({ config }: { config: DashboardConfig }) {
  // Show a simplified, readable version of the config
  const displayConfig = useMemo(
    () =>
      JSON.stringify(
        {
          type: 'widget',
          layout: 'grid',
          columns: config.columns,
          items: config.widgets.map((w) => ({
            id: w.id,
            type: w.type,
            title: w.title,
            span: w.span,
            ...(w.api ? { api: w.api } : {}),
          })),
        },
        null,
        2,
      ),
    [config],
  );

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300">dashboard.config.ts</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-green-400 max-h-64 overflow-y-auto">
        <code>{displayConfig}</code>
      </pre>
    </div>
  );
}
