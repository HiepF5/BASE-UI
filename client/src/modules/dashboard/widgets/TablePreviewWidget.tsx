import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../core/utils';
import type { TablePreviewWidgetConfig, TablePreviewData } from './types';

// ============================================================
// TablePreviewWidget - Compact table showing recent records
// Pure presentational – receives config + data via props
// ============================================================

export interface TablePreviewWidgetProps {
  config: TablePreviewWidgetConfig;
  data: TablePreviewData;
  className?: string;
}

export function TablePreviewWidget({ config, data, className }: TablePreviewWidgetProps) {
  const maxRows = config.maxRows ?? 5;
  const visibleRows = data.rows.slice(0, maxRows);

  return (
    <div
      className={cn(
        'bg-white rounded-xl border transition-shadow hover:shadow-md overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="text-sm font-semibold text-neutral-700">{config.title}</h3>
        {config.viewAllLink && (
          <Link
            to={config.viewAllLink}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50">
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-neutral-50/50 transition-colors">
                {data.columns.map((col) => (
                  <td key={col.key} className="px-5 py-2.5 text-neutral-700 whitespace-nowrap">
                    {renderCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={data.columns.length}
                  className="px-5 py-8 text-center text-neutral-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Render cell value with status badge support */
function renderCell(value: unknown) {
  if (value === null || value === undefined) {
    return <span className="text-neutral-300">—</span>;
  }

  // Status badge pattern
  if (
    typeof value === 'object' &&
    value !== null &&
    '_type' in value &&
    (value as Record<string, unknown>)._type === 'badge'
  ) {
    const badge = value as Record<string, unknown>;
    const badgeColors: Record<string, string> = {
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
      neutral: 'bg-neutral-100 text-neutral-600',
    };
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          badgeColors[String(badge.variant ?? 'neutral')],
        )}
      >
        {String(badge.text)}
      </span>
    );
  }

  return String(value);
}
