import React, { useMemo } from 'react';
import { cn } from '../../../core/utils';
import type { ChartWidgetConfig, ChartData } from './types';

// ============================================================
// ChartWidget - Lightweight SVG chart (bar / line / area)
// No external chart library – pure SVG + Tailwind
// Pure presentational – receives config + data via props
// ============================================================

export interface ChartWidgetProps {
  config: ChartWidgetConfig;
  data: ChartData;
  className?: string;
}

const defaultColors = [
  '#2563eb', // primary-600
  '#9333ea', // violet-600
  '#16a34a', // green-600
  '#ea580c', // orange-600
  '#dc2626', // red-600
];

// ── Bar Chart ───────────────────────────────────────────────

function BarChart({ data }: { data: ChartData }) {
  const series = data.series[0]; // single series for bar
  if (!series) return null;

  const maxValue = Math.max(...series.data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-48 px-2 pt-2 pb-1">
      {series.data.map((point, i) => {
        const height = (point.value / maxValue) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-neutral-400 font-medium">{point.value}</span>
            <div className="w-full flex justify-center">
              <div
                className="w-full max-w-[40px] rounded-t-md transition-all duration-500 ease-out bg-primary-500 hover:bg-primary-600"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${point.label}: ${point.value}`}
              />
            </div>
            <span className="text-[10px] text-neutral-400 truncate w-full text-center">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Line / Area Chart (SVG) ─────────────────────────────────

function LineAreaChart({ data, showArea }: { data: ChartData; showArea?: boolean }) {
  const WIDTH = 500;
  const HEIGHT = 180;
  const PADDING = { top: 10, right: 10, bottom: 30, left: 10 };
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const allValues = useMemo(
    () => data.series.flatMap((s) => s.data.map((d) => d.value)),
    [data.series],
  );
  const minVal = Math.min(...allValues, 0);
  const maxVal = Math.max(...allValues, 1);
  const range = maxVal - minVal || 1;

  const xLabels = data.xLabels ?? data.series[0]?.data.map((d) => d.label) ?? [];

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-48" preserveAspectRatio="none">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = PADDING.top + chartH * (1 - ratio);
        return (
          <line
            key={ratio}
            x1={PADDING.left}
            y1={y}
            x2={WIDTH - PADDING.right}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Series */}
      {data.series.map((series, si) => {
        const color = series.color ?? defaultColors[si % defaultColors.length];
        const points = series.data.map((d, i) => {
          const x = PADDING.left + (i / Math.max(series.data.length - 1, 1)) * chartW;
          const y = PADDING.top + chartH * (1 - (d.value - minVal) / range);
          return { x, y };
        });

        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        const areaPath = showArea
          ? `${linePath} L ${points[points.length - 1].x} ${PADDING.top + chartH} L ${points[0].x} ${PADDING.top + chartH} Z`
          : '';

        return (
          <g key={si}>
            {showArea && <path d={areaPath} fill={color} fillOpacity={0.08} />}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={2}>
                <title>{`${series.data[i].label}: ${series.data[i].value}`}</title>
              </circle>
            ))}
          </g>
        );
      })}

      {/* X labels */}
      {xLabels.map((label, i) => {
        const x = PADDING.left + (i / Math.max(xLabels.length - 1, 1)) * chartW;
        return (
          <text
            key={i}
            x={x}
            y={HEIGHT - 5}
            textAnchor="middle"
            className="fill-neutral-400"
            fontSize={10}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Legend ───────────────────────────────────────────────────

function ChartLegend({ data }: { data: ChartData }) {
  if (data.series.length <= 1) return null;
  return (
    <div className="flex items-center gap-4 px-1 pt-2">
      {data.series.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: s.color ?? defaultColors[i % defaultColors.length] }}
          />
          <span className="text-xs text-neutral-500">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────

export function ChartWidget({ config, data, className }: ChartWidgetProps) {
  return (
    <div
      className={cn('bg-white rounded-xl border p-5 transition-shadow hover:shadow-md', className)}
    >
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">{config.title}</h3>

      {config.chartType === 'bar' && <BarChart data={data} />}
      {config.chartType === 'line' && <LineAreaChart data={data} />}
      {config.chartType === 'area' && <LineAreaChart data={data} showArea />}

      <ChartLegend data={data} />
    </div>
  );
}
