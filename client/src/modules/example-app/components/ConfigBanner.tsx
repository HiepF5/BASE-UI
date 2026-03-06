import React from 'react';
import { BaseButton } from '../../../components/base';
import type { ConfigBannerProps } from '../types/example-app.types';

// ============================================================
// ConfigBanner - Shows config-driven explanation
// ============================================================

export function ConfigBanner({ schema, showConfig, onToggle }: ConfigBannerProps) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-indigo-800 mb-0.5">
            💡 Config-driven: One EntitySchema JSON → Full CRUD Module
          </h3>
          <p className="text-xs text-indigo-700">
            Each entity below is defined by a single{' '}
            <code className="bg-indigo-100 px-1 rounded">EntitySchema</code> object. Table, form,
            filter, relation, validation, pagination – all auto-rendered.
          </p>
        </div>
        <BaseButton size="sm" variant="outline" onClick={onToggle}>
          {showConfig ? 'Hide Config' : 'View Config JSON'}
        </BaseButton>
      </div>

      {showConfig && (
        <pre className="mt-3 bg-indigo-900 text-green-400 rounded-lg p-3 text-[11px] overflow-auto max-h-80 font-mono">
          {JSON.stringify(schema, null, 2)}
        </pre>
      )}
    </div>
  );
}

ConfigBanner.displayName = 'ConfigBanner';
