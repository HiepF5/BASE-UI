// ============================================================
// Dashboard Types - Widget engine types
// ============================================================

/** Trend direction for KPI cards */
export type TrendDirection = 'up' | 'down' | 'neutral';

/** Chart type variants */
export type ChartType = 'line' | 'bar' | 'area';

/** Widget size in grid (1-based column span) */
export type WidgetSpan = 1 | 2 | 3 | 4;

// ── Base Widget Config ──────────────────────────────────────

interface BaseWidgetConfig {
  id: string;
  title: string;
  /** API endpoint to fetch data (optional for static/mock) */
  api?: string;
  /** Column span in the grid (default: 1) */
  span?: WidgetSpan;
  /** Row span (default: 1) */
  rowSpan?: number;
}

// ── KPI Widget ──────────────────────────────────────────────

export interface KpiWidgetConfig extends BaseWidgetConfig {
  type: 'kpi';
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
}

export interface KpiData {
  value: string | number;
  label: string;
  change?: number;
  trend?: TrendDirection;
  period?: string;
}

// ── Chart Widget ────────────────────────────────────────────

export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'chart';
  chartType: ChartType;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  color?: string;
  data: ChartDataPoint[];
}

export interface ChartData {
  series: ChartSeries[];
  xLabels?: string[];
}

// ── Table Preview Widget ────────────────────────────────────

export interface TablePreviewWidgetConfig extends BaseWidgetConfig {
  type: 'table';
  /** Max rows to display */
  maxRows?: number;
  /** Link to full table page */
  viewAllLink?: string;
}

export interface TablePreviewColumn {
  key: string;
  label: string;
}

export interface TablePreviewData {
  columns: TablePreviewColumn[];
  rows: Record<string, unknown>[];
}

// ── Activity Feed Widget ────────────────────────────────────

export interface ActivityFeedWidgetConfig extends BaseWidgetConfig {
  type: 'activity';
  /** Max items to show */
  maxItems?: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'system';
}

export interface ActivityFeedData {
  items: ActivityItem[];
}

// ── Quick Actions Widget ────────────────────────────────────

export interface QuickActionsWidgetConfig extends BaseWidgetConfig {
  type: 'quick-actions';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
}

export interface QuickActionsData {
  actions: QuickAction[];
}

// ── Union Types ─────────────────────────────────────────────

export type WidgetConfig =
  | KpiWidgetConfig
  | ChartWidgetConfig
  | TablePreviewWidgetConfig
  | ActivityFeedWidgetConfig
  | QuickActionsWidgetConfig;

export type WidgetData =
  | KpiData
  | ChartData
  | TablePreviewData
  | ActivityFeedData
  | QuickActionsData;

// ── Dashboard Config ────────────────────────────────────────

export interface DashboardConfig {
  title: string;
  description?: string;
  /** Grid columns (default: 4) */
  columns?: number;
  /** Gap between widgets (tailwind spacing scale) */
  gap?: number;
  /** Widget definitions */
  widgets: WidgetConfig[];
}
