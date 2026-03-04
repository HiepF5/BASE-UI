import type { ColumnConfig } from '../../types';

// ============================================================
// Export CSV - Pure utility function
// Converts table data + column config → CSV string → download
// ============================================================

/**
 * Convert data array to CSV string using column configs for headers
 */
export function dataToCSV(
  data: Record<string, unknown>[],
  columns: ColumnConfig[],
  options?: {
    /** Include only visible columns (default: true) */
    visibleOnly?: boolean;
    /** CSV delimiter (default: ',') */
    delimiter?: string;
  },
): string {
  const { visibleOnly = true, delimiter = ',' } = options ?? {};

  const cols = visibleOnly ? columns.filter((c) => c.visible) : columns;

  // Header row
  const header = cols.map((c) => escapeCSV(c.label)).join(delimiter);

  // Data rows
  const rows = data.map((row) =>
    cols
      .map((col) => {
        const value = row[col.name];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return escapeCSV(JSON.stringify(value));
        return escapeCSV(String(value));
      })
      .join(delimiter),
  );

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file from data
 */
export function downloadCSV(
  data: Record<string, unknown>[],
  columns: ColumnConfig[],
  filename?: string,
): void {
  const csv = dataToCSV(data, columns);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Escape a CSV cell value (handle quotes, commas, newlines) */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
