import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  Package,
  Database,
  Zap,
} from 'lucide-react';
import { cn } from '../../../core/utils';
import type { KpiWidgetConfig, KpiData, TrendDirection } from './types';

// ============================================================
// KpiCard - Displays a single KPI metric with trend indicator
// Pure presentational – receives config + data via props
// ============================================================

export interface KpiCardProps {
  config: KpiWidgetConfig;
  data: KpiData;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  cart: ShoppingCart,
  dollar: DollarSign,
  activity: Activity,
  package: Package,
  database: Database,
  zap: Zap,
};

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    border: 'border-primary-200',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
  },
  accent: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    border: 'border-violet-200',
  },
};

const trendConfig: Record<TrendDirection, { icon: React.ElementType; color: string }> = {
  up: { icon: TrendingUp, color: 'text-green-600' },
  down: { icon: TrendingDown, color: 'text-red-600' },
  neutral: { icon: Minus, color: 'text-neutral-400' },
};

export function KpiCard({ config, data, className }: KpiCardProps) {
  const color = colorMap[config.color ?? 'primary'];
  const IconComponent = useMemo(
    () => (config.icon ? (iconMap[config.icon] ?? Activity) : Activity),
    [config.icon],
  );

  const trend = data.trend ?? 'neutral';
  const TrendIcon = trendConfig[trend].icon;
  const trendColor = trendConfig[trend].color;

  return (
    <div
      className={cn('bg-white rounded-xl border p-5 transition-shadow hover:shadow-md', className)}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-500 truncate">{data.label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{data.value}</p>

          {/* Trend */}
          {data.change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <TrendIcon className={cn('h-4 w-4', trendColor)} />
              <span className={cn('text-sm font-medium', trendColor)}>
                {data.change > 0 ? '+' : ''}
                {data.change}%
              </span>
              {data.period && <span className="text-xs text-neutral-400">vs {data.period}</span>}
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={cn('flex-shrink-0 rounded-lg p-2.5', color.bg)}>
          <IconComponent className={cn('h-5 w-5', color.icon)} />
        </div>
      </div>
    </div>
  );
}
