// ============================================================
// Dashboard Widgets - Public API
// ============================================================

// Types
export type {
  DashboardConfig,
  WidgetConfig,
  WidgetData,
  KpiWidgetConfig,
  KpiData,
  ChartWidgetConfig,
  ChartData,
  ChartDataPoint,
  ChartSeries,
  TablePreviewWidgetConfig,
  TablePreviewData,
  TablePreviewColumn,
  ActivityFeedWidgetConfig,
  ActivityFeedData,
  ActivityItem,
  QuickActionsWidgetConfig,
  QuickActionsData,
  QuickAction,
  TrendDirection,
  ChartType,
  WidgetSpan,
} from './types';

// Components
export { KpiCard } from './KpiCard';
export type { KpiCardProps } from './KpiCard';

export { ChartWidget } from './ChartWidget';
export type { ChartWidgetProps } from './ChartWidget';

export { TablePreviewWidget } from './TablePreviewWidget';
export type { TablePreviewWidgetProps } from './TablePreviewWidget';

export { ActivityFeedWidget } from './ActivityFeedWidget';
export type { ActivityFeedWidgetProps } from './ActivityFeedWidget';

export { QuickActionsWidget } from './QuickActionsWidget';
export type { QuickActionsWidgetProps } from './QuickActionsWidget';

export { WidgetEngine } from './WidgetEngine';
export type { WidgetEngineProps } from './WidgetEngine';
