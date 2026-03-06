import React from 'react';
import { UserPlus, Edit, Trash2, LogIn, Settings } from 'lucide-react';
import { cn } from '../../../core/utils';
import type {
  ActivityFeedWidgetConfig,
  ActivityFeedData,
  ActivityItem,
} from '../types/dashboard.types';

// ============================================================
// ActivityFeedWidget - Timeline of recent system activity
// Pure presentational – receives config + data via props
// ============================================================

export interface ActivityFeedWidgetProps {
  config: ActivityFeedWidgetConfig;
  data: ActivityFeedData;
  className?: string;
}

const activityIcons: Record<ActivityItem['type'], React.ElementType> = {
  create: UserPlus,
  update: Edit,
  delete: Trash2,
  login: LogIn,
  system: Settings,
};

const activityColors: Record<ActivityItem['type'], { bg: string; icon: string; dot: string }> = {
  create: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    dot: 'bg-green-500',
  },
  update: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  delete: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    dot: 'bg-red-500',
  },
  login: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    dot: 'bg-violet-500',
  },
  system: {
    bg: 'bg-neutral-100',
    icon: 'text-neutral-500',
    dot: 'bg-neutral-400',
  },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return time.toLocaleDateString();
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const style = activityColors[item.type];
  const IconComponent = activityIcons[item.type];

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Icon */}
      <div className={cn('flex-shrink-0 rounded-lg p-2', style.bg)}>
        <IconComponent className={cn('h-4 w-4', style.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700">
          <span className="font-medium text-neutral-900">{item.user}</span> {item.action}{' '}
          <span className="font-medium text-neutral-800">{item.target}</span>
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{formatTimeAgo(item.timestamp)}</p>
      </div>

      {/* Dot indicator */}
      <div className={cn('flex-shrink-0 mt-2 h-2 w-2 rounded-full', style.dot)} />
    </div>
  );
}

export function ActivityFeedWidget({ config, data, className }: ActivityFeedWidgetProps) {
  const maxItems = config.maxItems ?? 8;
  const visibleItems = data.items.slice(0, maxItems);

  return (
    <div className={cn('bg-white rounded-xl border transition-shadow hover:shadow-md', className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b">
        <h3 className="text-sm font-semibold text-neutral-700">{config.title}</h3>
      </div>

      {/* Feed */}
      <div className="px-5 divide-y divide-neutral-100 max-h-[400px] overflow-y-auto">
        {visibleItems.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
        {visibleItems.length === 0 && (
          <div className="py-8 text-center text-neutral-400 text-sm">No recent activity</div>
        )}
      </div>
    </div>
  );
}
