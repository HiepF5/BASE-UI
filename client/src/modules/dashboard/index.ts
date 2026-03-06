// ============================================================
// Dashboard Module - Public Exports
// ============================================================

// Pages
export { DashboardPage } from './pages/DashboardPage';

// Components
export {
  KpiCard,
  ChartWidget,
  TablePreviewWidget,
  ActivityFeedWidget,
  QuickActionsWidget,
  WidgetEngine,
} from './components';
export type {
  KpiCardProps,
  ChartWidgetProps,
  TablePreviewWidgetProps,
  ActivityFeedWidgetProps,
  QuickActionsWidgetProps,
  WidgetEngineProps,
} from './components';

// Hooks
export { useDashboard, useWidgetData, useDashboardConfig } from './hooks/useDashboard';

// Config
export { dashboardConfig, mockDataMap } from './config/dashboard.config';

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
} from './types/dashboard.types';
