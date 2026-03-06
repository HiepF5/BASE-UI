import React from 'react';

// ============================================================
// SearchBar - Search input component
// ============================================================

export interface SearchBarComponentProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, placeholder, onChange }: SearchBarComponentProps) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  );
}

SearchBar.displayName = 'SearchBar';
