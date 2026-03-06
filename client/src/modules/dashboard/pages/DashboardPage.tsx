// ============================================================
// DashboardPage - Dynamic Analytics Screen
// ============================================================

import React, { useState } from 'react';
import { LayoutDashboard, RefreshCw, Code2, ChevronDown } from 'lucide-react';
import { cn } from '../../../core/utils';
import { WidgetEngine } from '../components';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardConfig } from '../types/dashboard.types';

export function DashboardPage() {
  const [showConfig, setShowConfig] = useState(false);
  const { config, dataMap, refresh } = useDashboard();

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-50">
            <LayoutDashboard className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{config.title}</h1>
            <p className="text-sm text-neutral-500">{config.description}</p>
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
            onClick={refresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Config Preview Panel ─────────────────────────── */}
      {showConfig && <ConfigPreview config={config} />}

      {/* ── Widget Engine (Config-driven grid) ───────────── */}
      <WidgetEngine config={config} dataMap={dataMap} />
    </div>
  );
}

// ── Config Preview Component ────────────────────────────────

function ConfigPreview({ config }: { config: DashboardConfig }) {
  const displayConfig = JSON.stringify(
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
