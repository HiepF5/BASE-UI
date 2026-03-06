import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemaRegistry } from '../../../config/schema.config';
import { layoutConfig } from '../../../config/layout.config';
import type { EntitySchema } from '../../../core/metadata/schema.types';
import toast from 'react-hot-toast';

// ============================================================
// CommandPalettePage — Screen 8: COMMAND PALETTE
// Platform-level ⌘K experience:
// ✅ Global search module — search pages, entities, actions, fields
// ✅ Quick create — create new entity records from palette
// ✅ Navigate entity — jump to any entity/module instantly
// ============================================================

// ─── Types ───────────────────────────────────────────────────

type CommandCategory = 'navigate' | 'entity' | 'action' | 'field' | 'recent';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: CommandCategory;
  /** Action to run when selected */
  action: () => void;
  /** Extra keywords for fuzzy match */
  keywords?: string[];
  /** Right-side shortcut hint */
  shortcut?: string;
}

// ─── Section Wrapper ─────────────────────────────────────────

function Section({
  title,
  description,
  children,
  badge,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Category labels & colors ────────────────────────────────

const CATEGORY_META: Record<CommandCategory, { label: string; color: string; icon: string }> = {
  navigate: { label: 'Pages', color: 'bg-blue-100 text-blue-700', icon: '🧭' },
  entity: { label: 'Entities', color: 'bg-green-100 text-green-700', icon: '🗂️' },
  action: { label: 'Actions', color: 'bg-amber-100 text-amber-700', icon: '⚡' },
  field: { label: 'Fields', color: 'bg-purple-100 text-purple-700', icon: '🔤' },
  recent: { label: 'Recent', color: 'bg-neutral-100 text-neutral-600', icon: '🕐' },
};

// ─── Build Commands Registry ─────────────────────────────────

function useCommandsRegistry(navigate: ReturnType<typeof useNavigate>) {
  return useMemo(() => {
    const commands: CommandItem[] = [];

    // 1) Navigation commands — from layout config
    for (const section of layoutConfig.sidebar.sections) {
      for (const item of section.items) {
        commands.push({
          id: `nav:${item.to}`,
          label: item.label,
          description: `Navigate to ${item.label}`,
          icon: item.icon,
          category: 'navigate',
          action: () => navigate(item.to),
          keywords: [section.label, item.to],
          shortcut: item.to,
        });
      }
    }

    // 2) Entity commands — from schemaRegistry
    for (const [key, schema] of Object.entries(schemaRegistry) as [string, EntitySchema][]) {
      commands.push({
        id: `entity:${key}`,
        label: schema.label,
        description: `Browse ${schema.label} (${schema.fields.length} fields)`,
        icon: schema.icon ?? '📄',
        category: 'entity',
        action: () => navigate(`/crud/default/${key}`),
        keywords: [key, schema.name, ...schema.fields.map((f) => f.name)],
      });

      // Quick Create command per entity
      if (schema.permissions?.create) {
        commands.push({
          id: `action:create:${key}`,
          label: `Create ${schema.label}`,
          description: `Open create form for ${schema.label}`,
          icon: '➕',
          category: 'action',
          action: () => {
            toast.success(`Quick Create: ${schema.label} (mockup — would open form dialog)`);
          },
          keywords: ['create', 'new', 'add', key],
        });
      }

      // Field-level search items
      for (const field of schema.fields) {
        commands.push({
          id: `field:${key}:${field.name}`,
          label: `${schema.label} → ${field.label}`,
          description: `Field: ${field.type}${field.validation?.required ? ' (required)' : ''}`,
          icon: '🔤',
          category: 'field',
          action: () => {
            toast(`Field: ${field.name} [${field.type}] in ${schema.label}`);
          },
          keywords: [field.name, field.type, key],
        });
      }
    }

    // 3) Global actions
    commands.push(
      {
        id: 'action:theme:toggle',
        label: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: '🌓',
        category: 'action',
        action: () => {
          const html = document.documentElement;
          const current = html.getAttribute('data-theme');
          const next = current === 'dark' ? 'light' : 'dark';
          html.setAttribute('data-theme', next);
          localStorage.setItem('theme', next);
          toast.success(`Theme: ${next}`);
        },
        keywords: ['dark', 'light', 'theme', 'mode'],
        shortcut: '⌘⇧T',
      },
      {
        id: 'action:sidebar:toggle',
        label: 'Toggle Sidebar',
        description: 'Collapse or expand the sidebar',
        icon: '📐',
        category: 'action',
        action: () => toast('Sidebar toggled (demo)'),
        keywords: ['sidebar', 'collapse', 'expand'],
        shortcut: '⌘B',
      },
      {
        id: 'action:export',
        label: 'Export Data',
        description: 'Export current view as CSV',
        icon: '📤',
        category: 'action',
        action: () => toast('Export triggered (demo)'),
        keywords: ['export', 'csv', 'download'],
        shortcut: '⌘⇧E',
      },
      {
        id: 'action:settings',
        label: 'Open Settings',
        description: 'Navigate to system settings',
        icon: '⚙️',
        category: 'action',
        action: () => navigate('/showcase/settings'),
        keywords: ['settings', 'config', 'options'],
        shortcut: '⌘,',
      },
    );

    return commands;
  }, [navigate]);
}

// ─── Fuzzy matching ──────────────────────────────────────────

function fuzzyMatch(query: string, item: CommandItem): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const terms = q.split(/\s+/);

  let score = 0;
  const haystack = [item.label, item.description, ...(item.keywords ?? [])].join(' ').toLowerCase();

  for (const term of terms) {
    if (!haystack.includes(term)) return 0; // all terms must match
    // Bonus for label match
    if (item.label.toLowerCase().includes(term)) score += 3;
    // Bonus for exact start
    if (item.label.toLowerCase().startsWith(term)) score += 5;
    score += 1;
  }

  return score;
}

// ─── Command Palette Dialog ──────────────────────────────────

function CommandPaletteDialog({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  commands: CommandItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CommandCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setCategoryFilter(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter & sort
  const filtered = useMemo(() => {
    let items = commands;

    // Category filter
    if (categoryFilter) {
      items = items.filter((c) => c.category === categoryFilter);
    }

    // Search
    if (query.trim()) {
      const scored = items
        .map((item) => ({ item, score: fuzzyMatch(query, item) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);
      return scored.map((r) => r.item);
    }

    // Default: group by category, limit each
    return items;
  }, [commands, query, categoryFilter]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<CommandCategory, CommandItem[]>();
    for (const item of filtered) {
      const cat = item.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)?.push(item);
    }
    // Limit field results
    const fieldItems = map.get('field');
    if (fieldItems) {
      map.set('field', fieldItems.slice(0, 10));
    }
    return map;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => {
    const items: CommandItem[] = [];
    for (const group of grouped.values()) {
      items.push(...group);
    }
    return items;
  }, [grouped]);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatList[activeIndex]) {
        e.preventDefault();
        flatList[activeIndex].action();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [flatList, activeIndex, onClose],
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
          <span className="text-neutral-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder-neutral-400"
          />
          <kbd className="text-[10px] text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Category filters */}
        <div className="flex gap-1 px-4 py-2 border-b border-neutral-100 bg-neutral-50">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors
              ${!categoryFilter ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_META) as CommandCategory[])
            .filter((cat) => cat !== 'recent')
            .map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = commands.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors
                    ${categoryFilter === cat ? 'bg-neutral-800 text-white' : `${meta.color} hover:opacity-80`}`}
                >
                  {meta.icon} {meta.label} ({count})
                </button>
              );
            })}
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {flatList.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-400">
              No results for &quot;{query}&quot;
            </div>
          )}
          {Array.from(grouped.entries()).map(([category, items]) => {
            const meta = CATEGORY_META[category];
            return (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {meta.icon} {meta.label}
                </div>
                {items.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.label}</div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {item.description}
                        </div>
                      </div>
                      {item.shortcut && (
                        <kbd className="text-[10px] text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 font-mono shrink-0">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isActive && <span className="text-[10px] text-primary-500 shrink-0">↵</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-[10px] text-neutral-400">
          <span>{flatList.length} commands available</span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Create Card ───────────────────────────────────────

function QuickCreatePanel() {
  const entities = useMemo(
    () =>
      Object.entries(schemaRegistry)
        .filter(([, schema]) => schema.permissions?.create)
        .map(([key, schema]) => ({
          key,
          label: schema.label,
          icon: schema.icon ?? '📄',
          fields: schema.fields.filter((f) => f.visibleInCreate).length,
          required: schema.fields.filter((f) => f.validation?.required).length,
        })),
    [],
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {entities.map((e) => (
        <button
          key={e.key}
          onClick={() => toast.success(`Quick Create: ${e.label} — would open create dialog`)}
          className="group border border-neutral-200 rounded-lg p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-all"
        >
          <div className="text-2xl mb-2">{e.icon}</div>
          <div className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700">
            {e.label}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {e.fields} fields · {e.required} required
          </div>
          <div className="mt-2 text-[10px] font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
            + Create New
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Navigate Entity Panel ───────────────────────────────────

function EntityNavigatorPanel() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const entities = useMemo(
    () =>
      Object.entries(schemaRegistry).map(([key, schema]) => ({
        key,
        label: schema.label,
        icon: schema.icon ?? '📄',
        description: schema.description ?? key,
        fieldCount: schema.fields.length,
        primaryKey: schema.primaryKey,
        displayField: schema.displayField,
        permissions: schema.permissions,
        fields: schema.fields,
      })),
    [],
  );

  const selectedEntity = entities.find((e) => e.key === selected);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Entity list */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {entities.map((e) => (
          <button
            key={e.key}
            onClick={() => setSelected(e.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
              ${
                selected === e.key
                  ? 'bg-primary-50 border-primary-200 border text-primary-700'
                  : 'border border-transparent hover:bg-neutral-50 text-neutral-700'
              }`}
          >
            <span className="text-lg">{e.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{e.label}</div>
              <div className="text-[11px] text-neutral-400">{e.fieldCount} fields</div>
            </div>
            <div className="flex gap-1">
              {e.permissions?.read && (
                <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded">R</span>
              )}
              {e.permissions?.create && (
                <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded">C</span>
              )}
              {e.permissions?.update && (
                <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded">U</span>
              )}
              {e.permissions?.delete && (
                <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded">D</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Entity detail */}
      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 min-h-[300px]">
        {selectedEntity ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{selectedEntity.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-neutral-800">{selectedEntity.label}</h4>
                <p className="text-[11px] text-neutral-500">{selectedEntity.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-[10px] bg-white border border-neutral-200 rounded px-2 py-1.5">
                <span className="text-neutral-400">Primary Key:</span>{' '}
                <code className="text-neutral-700 font-mono">{selectedEntity.primaryKey}</code>
              </div>
              <div className="text-[10px] bg-white border border-neutral-200 rounded px-2 py-1.5">
                <span className="text-neutral-400">Display Field:</span>{' '}
                <code className="text-neutral-700 font-mono">{selectedEntity.displayField}</code>
              </div>
            </div>

            <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Fields ({selectedEntity.fieldCount})
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {selectedEntity.fields.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2 text-[11px] py-1 px-2 bg-white rounded border border-neutral-100"
                >
                  <code className="font-mono text-neutral-700 w-28 truncate">{f.name}</code>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono">
                    {f.type}
                  </span>
                  {f.validation?.required && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-red-50 text-red-500">
                      req
                    </span>
                  )}
                  {f.sortable && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-500">
                      sort
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/crud/default/${selectedEntity.key}`)}
              className="mt-3 w-full px-3 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Open {selectedEntity.label} →
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-neutral-400">
            Select an entity to preview
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Keyboard Shortcuts Panel ────────────────────────────────

function ShortcutsPanel() {
  const shortcuts = useMemo(
    () => [
      { key: '⌘K', description: 'Open Command Palette', category: 'Global' },
      { key: '⌘B', description: 'Toggle Sidebar', category: 'Global' },
      { key: '⌘⇧T', description: 'Toggle Theme', category: 'Global' },
      { key: '⌘⇧E', description: 'Export Data', category: 'Global' },
      { key: '⌘,', description: 'Open Settings', category: 'Global' },
      { key: '↑ ↓', description: 'Navigate items', category: 'Palette' },
      { key: '↵', description: 'Select item', category: 'Palette' },
      { key: 'ESC', description: 'Close palette', category: 'Palette' },
      { key: 'Tab', description: 'Switch category', category: 'Palette' },
    ],
    [],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof shortcuts>();
    for (const s of shortcuts) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)?.push(s);
    }
    return map;
  }, [shortcuts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            {category}
          </div>
          <div className="space-y-1.5">
            {items.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-100"
              >
                <span className="text-xs text-neutral-700">{s.description}</span>
                <kbd className="text-[11px] font-mono bg-white border border-neutral-200 rounded px-2 py-0.5 text-neutral-600 shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function CommandPalettePage() {
  const navigate = useNavigate();
  const commands = useCommandsRegistry(navigate);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const byCategory = new Map<CommandCategory, number>();
    for (const cmd of commands) {
      byCategory.set(cmd.category, (byCategory.get(cmd.category) ?? 0) + 1);
    }
    return {
      total: commands.length,
      byCategory,
      entities: Object.keys(schemaRegistry).length,
      pages: layoutConfig.sidebar.sections.flatMap((s) => s.items).length,
    };
  }, [commands]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">🎯 Command Palette</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Platform-level ⌘K experience — Global module search, Quick create, Entity navigation.
          Press{' '}
          <kbd className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] border border-neutral-200 font-mono">
            ⌘K
          </kbd>{' '}
          or click the button below to open the Command Palette.
        </p>
      </div>

      {/* Architecture */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">Architecture</h3>
        <p className="text-xs text-blue-700">
          Commands are auto-generated from{' '}
          <code className="bg-blue-100 px-1 rounded">layoutConfig</code> (pages) +{' '}
          <code className="bg-blue-100 px-1 rounded">schemaRegistry</code> (entities & fields) +{' '}
          <code className="bg-blue-100 px-1 rounded">global actions</code>. Fuzzy search with
          scoring → keyboard-first navigation → instant execution.
        </p>
      </div>

      {/* Open button + stats */}
      <Section title="Command Palette" description="Click to open or press ⌘K anywhere">
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-neutral-800 text-white rounded-lg shadow-lg
              hover:bg-neutral-700 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <span className="text-lg">🔍</span>
            <span className="text-sm font-medium">Open Command Palette</span>
            <kbd className="text-[10px] bg-neutral-600 px-2 py-0.5 rounded font-mono">⌘K</kbd>
          </button>

          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-neutral-800">{stats.total}</div>
              <div className="text-[10px] text-neutral-500">Total Commands</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-800">{stats.pages}</div>
              <div className="text-[10px] text-neutral-500">Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-800">{stats.entities}</div>
              <div className="text-[10px] text-neutral-500">Entities</div>
            </div>
            {Array.from(stats.byCategory.entries()).map(([cat, count]) => (
              <div key={cat}>
                <div className="text-2xl font-bold text-neutral-800">{count}</div>
                <div className="text-[10px] text-neutral-500">{CATEGORY_META[cat].label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Quick Create */}
      <Section
        title="Quick Create"
        description="Create new entity records from any screen. Auto-discovered from schemaRegistry permissions."
        badge={
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {Object.values(schemaRegistry).filter((s) => s.permissions?.create).length} entities
          </span>
        }
      >
        <QuickCreatePanel />
      </Section>

      {/* Entity Navigator */}
      <Section
        title="Navigate Entity"
        description="Browse and inspect all registered entities. Jump to any entity CRUD page instantly."
        badge={
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {Object.keys(schemaRegistry).length} registered
          </span>
        }
      >
        <EntityNavigatorPanel />
      </Section>

      {/* Keyboard Shortcuts */}
      <Section
        title="Keyboard Shortcuts"
        description="Platform-wide keyboard shortcuts for power users."
      >
        <ShortcutsPanel />
      </Section>

      {/* Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Checklist</h3>
        <ul className="text-xs text-green-700 space-y-0.5">
          <li>
            ✅ Global search module — Fuzzy search across pages, entities, fields, actions with
            scoring
          </li>
          <li>
            ✅ Quick create — Create cards for every entity with create permission from
            schemaRegistry
          </li>
          <li>
            ✅ Navigate entity — Entity browser with field inspector, CRUD permissions, quick jump
          </li>
          <li>✅ Keyboard-first — ⌘K toggle, ↑↓ navigate, ↵ select, ESC close, category filters</li>
          <li>✅ Config-driven — Commands auto-generated from layoutConfig + schemaRegistry</li>
        </ul>
      </div>

      {/* Palette dialog */}
      <CommandPaletteDialog
        open={paletteOpen}
        commands={commands}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
