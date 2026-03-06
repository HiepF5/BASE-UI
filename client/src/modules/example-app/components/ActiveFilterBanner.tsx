import React from 'react';

// ============================================================
// ActiveFilterBanner - Shows when filter is applied but panel hidden
// ============================================================

export interface ActiveFilterBannerComponentProps {
  conditionCount: number;
  sqlPreview: string;
  onEdit: () => void;
  onClear: () => void;
}

export function ActiveFilterBanner({
  conditionCount,
  sqlPreview,
  onEdit,
  onClear,
}: ActiveFilterBannerComponentProps) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
      <span className="text-amber-700 font-medium">
        Active filter: {conditionCount} condition(s)
      </span>
      {sqlPreview && (
        <code className="text-amber-600 font-mono text-[10px] flex-1 truncate">
          WHERE {sqlPreview}
        </code>
      )}
      <button onClick={onEdit} className="text-amber-600 hover:text-amber-700 underline">
        Edit
      </button>
      <button onClick={onClear} className="text-amber-600 hover:text-red-600">
        ×
      </button>
    </div>
  );
}

ActiveFilterBanner.displayName = 'ActiveFilterBanner';
