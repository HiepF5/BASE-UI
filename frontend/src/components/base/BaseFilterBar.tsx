import React, { useState, useCallback } from 'react';
import { Search, X, Filter, Download, Upload, RefreshCw } from 'lucide-react';
import { cn } from '@/core/utils';
import { useDebounce } from '@/hooks';
import { BaseButton } from './BaseButton';

/* ── Props ── */
export interface BaseFilterBarProps {
  /** Controlled search value */
  search?: string;
  onSearchChange?: (val: string) => void;
  /** Action buttons */
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onFilter?: () => void;
  /** Active filter count badge */
  filterCount?: number;
  /** Extra actions slot */
  extraActions?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export const BaseFilterBar: React.FC<BaseFilterBarProps> = ({
  search = '',
  onSearchChange,
  onRefresh,
  onExport,
  onImport,
  onFilter,
  filterCount = 0,
  extraActions,
  className,
  placeholder = 'Tìm kiếm…',
}) => {
  const [local, setLocal] = useState(search);

  const handleChange = useCallback(
    (val: string) => {
      setLocal(val);
      onSearchChange?.(val);
    },
    [onSearchChange],
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {local && (
            <button
              onClick={() => handleChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Filter button */}
      {onFilter && (
        <BaseButton variant="outline" size="sm" onClick={onFilter}>
          <Filter className="h-4 w-4" />
          Bộ lọc
          {filterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
              {filterCount}
            </span>
          )}
        </BaseButton>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1 ml-auto">
        {extraActions}
        {onRefresh && (
          <BaseButton variant="ghost" size="icon" onClick={onRefresh} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </BaseButton>
        )}
        {onExport && (
          <BaseButton variant="ghost" size="icon" onClick={onExport} title="Xuất dữ liệu">
            <Download className="h-4 w-4" />
          </BaseButton>
        )}
        {onImport && (
          <BaseButton variant="ghost" size="icon" onClick={onImport} title="Nhập dữ liệu">
            <Upload className="h-4 w-4" />
          </BaseButton>
        )}
      </div>
    </div>
  );
};
