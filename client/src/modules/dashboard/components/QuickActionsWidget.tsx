import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Search, Settings, Database, FileText, Zap } from 'lucide-react';
import { cn } from '../../../core/utils';
import type {
  QuickActionsWidgetConfig,
  QuickActionsData,
  QuickAction,
} from '../types/dashboard.types';

// ============================================================
// QuickActionsWidget - Grid of quick action buttons
// Pure presentational – receives config + data via props
// ============================================================

export interface QuickActionsWidgetProps {
  config: QuickActionsWidgetConfig;
  data: QuickActionsData;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  plus: Plus,
  download: Download,
  upload: Upload,
  search: Search,
  settings: Settings,
  database: Database,
  file: FileText,
  zap: Zap,
};

const colorMap: Record<string, { bg: string; hover: string; icon: string }> = {
  primary: {
    bg: 'bg-primary-50',
    hover: 'hover:bg-primary-100',
    icon: 'text-primary-600',
  },
  success: {
    bg: 'bg-green-50',
    hover: 'hover:bg-green-100',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    hover: 'hover:bg-yellow-100',
    icon: 'text-yellow-600',
  },
  danger: {
    bg: 'bg-red-50',
    hover: 'hover:bg-red-100',
    icon: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    icon: 'text-blue-600',
  },
  accent: {
    bg: 'bg-violet-50',
    hover: 'hover:bg-violet-100',
    icon: 'text-violet-600',
  },
};

function ActionButton({ action }: { action: QuickAction }) {
  const navigate = useNavigate();
  const color = colorMap[action.color ?? 'primary'];
  const IconComponent = iconMap[action.icon] ?? Zap;

  const handleClick = () => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent transition-all',
        color.bg,
        color.hover,
        'hover:border-neutral-200 hover:shadow-sm',
      )}
    >
      <IconComponent className={cn('h-6 w-6', color.icon)} />
      <span className="text-xs font-medium text-neutral-700">{action.label}</span>
      {action.description && (
        <span className="text-[10px] text-neutral-400 text-center leading-tight">
          {action.description}
        </span>
      )}
    </button>
  );
}

export function QuickActionsWidget({ config, data, className }: QuickActionsWidgetProps) {
  return (
    <div
      className={cn('bg-white rounded-xl border p-5 transition-shadow hover:shadow-md', className)}
    >
      <h3 className="text-sm font-semibold text-neutral-700 mb-4">{config.title}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.actions.map((action) => (
          <ActionButton key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}
