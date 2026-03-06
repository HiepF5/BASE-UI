import React from 'react';
import type { EntitySelectorProps } from '../types/example-app.types';

// ============================================================
// EntitySelector - Selector for example entities
// ============================================================

export function EntitySelector({ entities, activeEntity, onSelect }: EntitySelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {entities.map((e) => (
        <button
          key={e.key}
          onClick={() => onSelect(e.key)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
            activeEntity === e.key
              ? 'bg-primary-50 border-primary-300 text-primary-700 font-medium shadow-sm'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-200 hover:bg-neutral-50'
          }`}
        >
          <span className="text-lg">{e.icon}</span>
          <div className="text-left">
            <div className="font-medium">{e.label}</div>
            <div className="text-[10px] text-neutral-500">{e.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

EntitySelector.displayName = 'EntitySelector';
