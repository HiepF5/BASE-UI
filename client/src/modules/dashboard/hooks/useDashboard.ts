// ============================================================
// Dashboard Hooks
// ============================================================

import { useMemo, useCallback } from 'react';
import { dashboardConfig, mockDataMap } from '../config/dashboard.config';
import type { WidgetData, DashboardConfig } from '../types/dashboard.types';

/**
 * Hook for managing dashboard state and data
 * In production: each widget's `api` field → useQuery()
 */
export function useDashboard() {
  // Widget data (mock for now, will bind to API later)
  const dataMap = useMemo<Record<string, WidgetData>>(() => {
    return { ...mockDataMap };
  }, []);

  const handleRefresh = useCallback(() => {
    // In production: invalidate all widget queries
    window.location.reload();
  }, []);

  return {
    config: dashboardConfig,
    dataMap,
    refresh: handleRefresh,
  };
}

/**
 * Hook for fetching specific widget data
 */
export function useWidgetData(widgetId: string): WidgetData | undefined {
  const { dataMap } = useDashboard();
  return dataMap[widgetId];
}

/**
 * Hook to get dashboard config
 */
export function useDashboardConfig(): DashboardConfig {
  return dashboardConfig;
}
