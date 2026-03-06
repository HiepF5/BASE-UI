// ============================================================
// Dashboard Configuration - Config-driven widget layout
// This defines WHAT widgets to render and WHERE they sit
// Data is separate (fetched from API or mocked)
// ============================================================

import type {
  DashboardConfig,
  WidgetData,
  KpiData,
  ChartData,
  TablePreviewData,
  ActivityFeedData,
  QuickActionsData,
} from '../types/dashboard.types';

/**
 * Dashboard layout config following the blueprint:
 * ```ts
 * { type: "widget", layout: "grid", items: [...] }
 * ```
 */
export const dashboardConfig: DashboardConfig = {
  title: 'Dashboard',
  description: 'Dynamic Analytics Screen — Widget engine demo',
  columns: 4,
  gap: 5,
  widgets: [
    // ── Row 1: KPI Cards ──────────────────────────────────
    {
      id: 'kpi-users',
      type: 'kpi',
      title: 'Total Users',
      icon: 'users',
      color: 'primary',
      api: '/stats/users',
    },
    {
      id: 'kpi-orders',
      type: 'kpi',
      title: 'Orders',
      icon: 'cart',
      color: 'success',
      api: '/stats/orders',
    },
    {
      id: 'kpi-revenue',
      type: 'kpi',
      title: 'Revenue',
      icon: 'dollar',
      color: 'accent',
      api: '/stats/revenue',
    },
    {
      id: 'kpi-active',
      type: 'kpi',
      title: 'Active Sessions',
      icon: 'activity',
      color: 'warning',
      api: '/stats/sessions',
    },

    // ── Row 2: Charts ─────────────────────────────────────
    {
      id: 'chart-revenue',
      type: 'chart',
      title: 'Revenue Overview',
      chartType: 'area',
      span: 2,
      api: '/stats/revenue-chart',
    },
    {
      id: 'chart-orders',
      type: 'chart',
      title: 'Orders by Month',
      chartType: 'bar',
      span: 2,
      api: '/stats/orders-chart',
    },

    // ── Row 3: Quick Actions (full width) ─────────────────
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'Quick Actions',
      span: 4,
    },

    // ── Row 4: Table + Activity ───────────────────────────
    {
      id: 'table-recent-orders',
      type: 'table',
      title: 'Recent Orders',
      span: 3,
      maxRows: 5,
      viewAllLink: '/example-app',
      api: '/orders/recent',
    },
    {
      id: 'activity-feed',
      type: 'activity',
      title: 'Recent Activity',
      span: 1,
      maxItems: 6,
      api: '/activity/recent',
    },

    // ── Row 5: Additional chart ───────────────────────────
    {
      id: 'chart-users-growth',
      type: 'chart',
      title: 'User Growth',
      chartType: 'line',
      span: 2,
      api: '/stats/user-growth',
    },
    {
      id: 'chart-category',
      type: 'chart',
      title: 'Sales by Category',
      chartType: 'bar',
      span: 2,
      api: '/stats/category-sales',
    },
  ],
};

// ============================================================
// Mock Data - Will be replaced by API calls in production
// ============================================================

const now = new Date();
const timeAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const mockDataMap: Record<string, WidgetData> = {
  'kpi-users': {
    value: '12,847',
    label: 'Total Users',
    change: 12.5,
    trend: 'up',
    period: 'last month',
  } satisfies KpiData,

  'kpi-orders': {
    value: '3,482',
    label: 'Orders This Month',
    change: 8.2,
    trend: 'up',
    period: 'last month',
  } satisfies KpiData,

  'kpi-revenue': {
    value: '$284,520',
    label: 'Total Revenue',
    change: -2.4,
    trend: 'down',
    period: 'last month',
  } satisfies KpiData,

  'kpi-active': {
    value: '1,247',
    label: 'Active Now',
    change: 0,
    trend: 'neutral',
    period: 'today',
  } satisfies KpiData,

  'chart-revenue': {
    series: [
      {
        name: 'Revenue',
        color: '#2563eb',
        data: [
          { label: 'Jan', value: 18500 },
          { label: 'Feb', value: 22300 },
          { label: 'Mar', value: 19800 },
          { label: 'Apr', value: 27400 },
          { label: 'May', value: 32100 },
          { label: 'Jun', value: 28700 },
          { label: 'Jul', value: 35200 },
        ],
      },
      {
        name: 'Expenses',
        color: '#dc2626',
        data: [
          { label: 'Jan', value: 12000 },
          { label: 'Feb', value: 14200 },
          { label: 'Mar', value: 13100 },
          { label: 'Apr', value: 15800 },
          { label: 'May', value: 17500 },
          { label: 'Jun', value: 16200 },
          { label: 'Jul', value: 18900 },
        ],
      },
    ],
  } satisfies ChartData,

  'chart-orders': {
    series: [
      {
        name: 'Orders',
        data: [
          { label: 'Jan', value: 420 },
          { label: 'Feb', value: 380 },
          { label: 'Mar', value: 510 },
          { label: 'Apr', value: 470 },
          { label: 'May', value: 620 },
          { label: 'Jun', value: 580 },
          { label: 'Jul', value: 710 },
        ],
      },
    ],
  } satisfies ChartData,

  'quick-actions': {
    actions: [
      {
        id: 'create-record',
        label: 'New Record',
        icon: 'plus',
        description: 'Create a new entry',
        href: '/example-app',
        color: 'primary',
      },
      {
        id: 'export-data',
        label: 'Export CSV',
        icon: 'download',
        description: 'Download data',
        color: 'success',
      },
      {
        id: 'import-data',
        label: 'Import',
        icon: 'upload',
        description: 'Upload bulk data',
        color: 'info',
      },
      {
        id: 'search',
        label: 'Search',
        icon: 'search',
        description: 'Global search',
        color: 'accent',
      },
      {
        id: 'query-builder',
        label: 'Query Builder',
        icon: 'zap',
        description: 'Advanced filter',
        href: '/showcase/query-builder',
        color: 'danger',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'file',
        description: 'View reports',
        color: 'info',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        description: 'System config',
        color: 'primary',
      },
    ],
  } satisfies QuickActionsData,

  'table-recent-orders': {
    columns: [
      { key: 'id', label: 'Order ID' },
      { key: 'customer', label: 'Customer' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    rows: [
      {
        id: '#ORD-7291',
        customer: 'Alice Johnson',
        amount: '$1,250.00',
        status: { _type: 'badge', text: 'Completed', variant: 'success' },
        date: '2026-03-04',
      },
      {
        id: '#ORD-7290',
        customer: 'Bob Smith',
        amount: '$890.50',
        status: { _type: 'badge', text: 'Processing', variant: 'info' },
        date: '2026-03-04',
      },
      {
        id: '#ORD-7289',
        customer: 'Carol White',
        amount: '$2,100.00',
        status: { _type: 'badge', text: 'Pending', variant: 'warning' },
        date: '2026-03-03',
      },
      {
        id: '#ORD-7288',
        customer: 'David Brown',
        amount: '$450.00',
        status: { _type: 'badge', text: 'Completed', variant: 'success' },
        date: '2026-03-03',
      },
      {
        id: '#ORD-7287',
        customer: 'Eva Martinez',
        amount: '$3,200.00',
        status: { _type: 'badge', text: 'Cancelled', variant: 'danger' },
        date: '2026-03-02',
      },
    ],
  } satisfies TablePreviewData,

  'activity-feed': {
    items: [
      {
        id: '1',
        user: 'Alice Johnson',
        action: 'created order',
        target: '#ORD-7291',
        timestamp: timeAgo(5),
        type: 'create',
      },
      {
        id: '2',
        user: 'System',
        action: 'processed payment for',
        target: '#ORD-7290',
        timestamp: timeAgo(15),
        type: 'system',
      },
      {
        id: '3',
        user: 'Bob Smith',
        action: 'updated profile',
        target: 'Account Settings',
        timestamp: timeAgo(32),
        type: 'update',
      },
      {
        id: '4',
        user: 'Carol White',
        action: 'logged in from',
        target: 'Chrome / Windows',
        timestamp: timeAgo(45),
        type: 'login',
      },
      {
        id: '5',
        user: 'Admin',
        action: 'deleted record',
        target: 'Product #482',
        timestamp: timeAgo(120),
        type: 'delete',
      },
      {
        id: '6',
        user: 'David Brown',
        action: 'created',
        target: 'New Customer Report',
        timestamp: timeAgo(180),
        type: 'create',
      },
    ],
  } satisfies ActivityFeedData,

  'chart-users-growth': {
    series: [
      {
        name: 'New Users',
        color: '#9333ea',
        data: [
          { label: 'W1', value: 120 },
          { label: 'W2', value: 180 },
          { label: 'W3', value: 150 },
          { label: 'W4', value: 220 },
          { label: 'W5', value: 280 },
          { label: 'W6', value: 310 },
          { label: 'W7', value: 350 },
          { label: 'W8', value: 420 },
        ],
      },
      {
        name: 'Active Users',
        color: '#16a34a',
        data: [
          { label: 'W1', value: 800 },
          { label: 'W2', value: 850 },
          { label: 'W3', value: 920 },
          { label: 'W4', value: 980 },
          { label: 'W5', value: 1050 },
          { label: 'W6', value: 1120 },
          { label: 'W7', value: 1180 },
          { label: 'W8', value: 1247 },
        ],
      },
    ],
  } satisfies ChartData,

  'chart-category': {
    series: [
      {
        name: 'Sales',
        data: [
          { label: 'Electronics', value: 4500 },
          { label: 'Clothing', value: 2800 },
          { label: 'Food', value: 3200 },
          { label: 'Books', value: 1500 },
          { label: 'Sports', value: 2100 },
          { label: 'Home', value: 3800 },
        ],
      },
    ],
  } satisfies ChartData,
};
