import React from 'react';
import { cn } from '../../../core/utils';
import { KpiCard } from './KpiCard';
import { ChartWidget } from './ChartWidget';
import { TablePreviewWidget } from './TablePreviewWidget';
import { ActivityFeedWidget } from './ActivityFeedWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import type {
  WidgetConfig,
  WidgetData,
  KpiWidgetConfig,
  KpiData,
  ChartWidgetConfig,
  ChartData,
  TablePreviewWidgetConfig,
  TablePreviewData,
  ActivityFeedWidgetConfig,
  ActivityFeedData,
  QuickActionsWidgetConfig,
  QuickActionsData,
  DashboardConfig,
} from './types';

// ============================================================
// WidgetEngine - Config-driven widget renderer
// Reads DashboardConfig and renders appropriate widget components
// This is the core of the dashboard's "widget engine"
// ============================================================

export interface WidgetEngineProps {
  config: DashboardConfig;
  /** Data map: widget.id → widget data */
  dataMap: Record<string, WidgetData>;
  className?: string;
}

/** Span → Tailwind col-span class */
const spanMap: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-2 lg:col-span-3',
  4: 'col-span-1 md:col-span-2 lg:col-span-4',
};

/** Render a single widget based on its type */
function renderWidget(widget: WidgetConfig, data: WidgetData | undefined): React.ReactNode {
  if (!data) {
    return (
      <div className="bg-white rounded-xl border p-5 flex items-center justify-center h-32">
        <span className="text-sm text-neutral-400">Loading...</span>
      </div>
    );
  }

  switch (widget.type) {
    case 'kpi':
      return <KpiCard config={widget as KpiWidgetConfig} data={data as KpiData} />;
    case 'chart':
      return <ChartWidget config={widget as ChartWidgetConfig} data={data as ChartData} />;
    case 'table':
      return (
        <TablePreviewWidget
          config={widget as TablePreviewWidgetConfig}
          data={data as TablePreviewData}
        />
      );
    case 'activity':
      return (
        <ActivityFeedWidget
          config={widget as ActivityFeedWidgetConfig}
          data={data as ActivityFeedData}
        />
      );
    case 'quick-actions':
      return (
        <QuickActionsWidget
          config={widget as QuickActionsWidgetConfig}
          data={data as QuickActionsData}
        />
      );
    default:
      return (
        <div className="bg-white rounded-xl border p-5 text-center">
          <span className="text-sm text-neutral-400">
            Unknown widget type: {(widget as WidgetConfig).type}
          </span>
        </div>
      );
  }
}

export function WidgetEngine({ config, dataMap, className }: WidgetEngineProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5', className)}>
      {config.widgets.map((widget) => (
        <div
          key={widget.id}
          className={cn(spanMap[widget.span ?? 1])}
          style={widget.rowSpan ? { gridRow: `span ${widget.rowSpan}` } : undefined}
        >
          {renderWidget(widget, dataMap[widget.id])}
        </div>
      ))}
    </div>
  );
}
