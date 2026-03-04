import React, { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BaseButton } from '../../components/base';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useTableStore } from '../../stores/tableStore';
import {
  useMetadataStore,
  selectLoadedEntities,
  selectSchemasCount,
} from '../../stores/metadataStore';
import { useFormEngine } from '../../hooks/useFormEngine';
import { schemaRegistry } from '../../config/schema.config';
import { queryKeys } from '../../core/query';
import { DynamicForm } from '../../components/dynamic/DynamicForm';
import type { EntitySchema } from '../../core/metadata/schema.types';
import toast from 'react-hot-toast';

// ============================================================
// StateShowcasePage - Week 6 State Production Demo
// Demonstrates: React Query config, Zustand stores (devtools+immer),
//   Global Metadata Store, Form Engine, Optimistic Updates
// ============================================================

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-bg-secondary px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── 1. React Query Demo ─────────────────────────────────────

function ReactQueryDemo() {
  const queryClient = useQueryClient();
  const defaults = queryClient.getDefaultOptions();

  const queryConfig = {
    staleTime: defaults.queries?.staleTime ?? 'not set',
    gcTime: defaults.queries?.gcTime ?? 'not set',
    retry: defaults.queries?.retry ?? 'not set',
    refetchOnWindowFocus: defaults.queries?.refetchOnWindowFocus ?? 'not set',
    mutationRetry: defaults.mutations?.retry ?? 'not set',
  };

  const cacheSize = queryClient.getQueryCache().getAll().length;
  const mutationCount = queryClient.getMutationCache().getAll().length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Default Configuration</p>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(queryConfig, null, 2)}
          </pre>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Cache Status</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Cached Queries:</span>
              <span className="font-mono text-text-primary">{cacheSize}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Mutations:</span>
              <span className="font-mono text-text-primary">{mutationCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">Query Key Factory</p>
        <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
          {`queryKeys.crud.all()        → ${JSON.stringify(queryKeys.crud.all())}
queryKeys.crud.entity(…)    → ${JSON.stringify(queryKeys.crud.entity('default', 'users'))}
queryKeys.crud.list(…)      → ${JSON.stringify(queryKeys.crud.list('default', 'users', { page: 1 }))}
queryKeys.crud.detail(…)    → ${JSON.stringify(queryKeys.crud.detail('default', 'users', 1))}
queryKeys.schema.entity(…)  → ${JSON.stringify(queryKeys.schema.entity('default', 'users'))}
queryKeys.relation.options(…) → ${JSON.stringify(queryKeys.relation.options('default', 'users'))}`}
        </pre>
      </div>

      <div className="flex gap-2">
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.crud.all() });
            toast.success('All CRUD queries invalidated');
          }}
        >
          Invalidate All CRUD
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            queryClient.clear();
            toast.success('Query cache cleared');
          }}
        >
          Clear Cache
        </BaseButton>
      </div>
    </div>
  );
}

// ─── 2. Zustand Stores Demo ──────────────────────────────────

function ZustandStoresDemo() {
  const { sidebarOpen, theme, resolvedTheme, activeModal, activeConnection } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const tableStore = useTableStore();

  const uiState = {
    sidebarOpen,
    theme,
    resolvedTheme,
    activeModal: activeModal ?? 'none',
    activeConnection: activeConnection ?? 'none',
  };

  const authState = {
    isAuthenticated,
    username: user?.username ?? 'none',
    role: user?.role ?? 'none',
  };

  // Demo: switch table entity to show per-entity state
  const [demoEntity, setDemoEntity] = useState('users');
  const entities = ['users', 'orders', 'categories', 'products'];

  const handleSwitchEntity = useCallback(
    (entity: string) => {
      setDemoEntity(entity);
      tableStore.setActiveEntity(entity);
    },
    [tableStore],
  );

  const tableState = tableStore.getState();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">UI Store (devtools)</p>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(uiState, null, 2)}
          </pre>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Auth Store (persist)</p>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">
            Table Store (immer + devtools)
          </p>
          <div className="flex gap-1 mb-2">
            {entities.map((e) => (
              <button
                key={e}
                onClick={() => handleSwitchEntity(e)}
                className={`text-xs px-2 py-1 rounded ${
                  demoEntity === e
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-bg-secondary text-text-muted hover:bg-bg-secondary/80'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(tableState, null, 2)}
          </pre>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            tableStore.setPage(tableState.page + 1);
            toast.success(`Page → ${tableState.page + 1}`);
          }}
        >
          Page ++
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            tableStore.setSort([{ field: 'name', direction: 'asc' }]);
            toast.success('Sort set: name asc');
          }}
        >
          Set Sort
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            tableStore.setSearch('test search');
            toast.success('Search set: "test search"');
          }}
        >
          Set Search
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            tableStore.reset();
            toast.success('Table state reset');
          }}
        >
          Reset Table
        </BaseButton>
      </div>

      <p className="text-xs text-text-muted">
        💡 Open Redux DevTools (browser extension) to see action names like <code>setPage</code>,{' '}
        <code>setSort</code>, <code>reset</code> in the UIStore / TableStore.
      </p>
    </div>
  );
}

// ─── 3. Metadata Store Demo ──────────────────────────────────

function MetadataStoreDemo() {
  const metadataStore = useMetadataStore();
  const loadedEntities = useMetadataStore(selectLoadedEntities);
  const schemasCount = useMetadataStore(selectSchemasCount);

  const handlePreload = useCallback(() => {
    metadataStore.setSchemas(schemaRegistry);
    toast.success(`Preloaded ${Object.keys(schemaRegistry).length} schemas from static registry`);
  }, [metadataStore]);

  const handleClear = useCallback(() => {
    metadataStore.clear();
    toast.success('Metadata store cleared');
  }, [metadataStore]);

  const staleInfo = useMemo(() => {
    return loadedEntities.map((e) => ({
      entity: e,
      stale: metadataStore.isStale(e),
      lastUpdated: metadataStore.lastUpdated[e]
        ? new Date(metadataStore.lastUpdated[e]).toLocaleTimeString()
        : 'never',
    }));
  }, [loadedEntities, metadataStore]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Store Status</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Cached schemas:</span>
              <span className="font-mono text-text-primary">{schemasCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Loaded entities:</span>
              <span className="font-mono text-text-primary">
                {loadedEntities.length > 0 ? loadedEntities.join(', ') : 'none'}
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Stale Check (5min TTL)</p>
          {staleInfo.length === 0 ? (
            <p className="text-xs text-text-muted">No schemas loaded yet.</p>
          ) : (
            <div className="space-y-1">
              {staleInfo.map((info) => (
                <div key={info.entity} className="flex justify-between text-xs">
                  <span className="font-mono">{info.entity}</span>
                  <span>
                    {info.stale ? '🔴 stale' : '🟢 fresh'} · {info.lastUpdated}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <BaseButton size="sm" variant="primary" onClick={handlePreload}>
          Preload All Schemas
        </BaseButton>
        <BaseButton size="sm" variant="secondary" onClick={handleClear}>
          Clear Metadata
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          onClick={() => {
            const has = metadataStore.hasSchema('users');
            toast(has ? '✅ users schema is cached' : '❌ users schema not found');
          }}
        >
          Check &quot;users&quot;
        </BaseButton>
      </div>

      <p className="text-xs text-text-muted">
        💡 When navigating between entity pages, resolved schemas are cached in MetadataStore. This
        avoids redundant API calls and provides instant schema access.
      </p>
    </div>
  );
}

// ─── 4. Form Engine Demo ─────────────────────────────────────

function FormEngineDemo() {
  const [activeEntity, setActiveEntity] = useState('users');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [lastSubmitted, setLastSubmitted] = useState<Record<string, unknown> | null>(null);

  const schema = schemaRegistry[activeEntity] as EntitySchema;

  const mockEditData: Record<string, Record<string, unknown>> = {
    users: { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', is_active: true },
    orders: { id: 1, order_number: 'ORD-001', user_id: 1, total: 1250.0, status: 'delivered' },
    categories: { id: 1, name: 'Electronics', slug: 'electronics', is_active: true, sort_order: 1 },
    products: { id: 1, name: 'iPhone 15', price: 1199, category_id: 2, is_active: true },
  };

  const formEngine = useFormEngine({
    schema,
    mode: formMode,
    defaultValues: formMode === 'edit' ? mockEditData[activeEntity] : undefined,
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 500));
      setLastSubmitted(data as Record<string, unknown>);
      toast.success(`${formMode === 'create' ? 'Created' : 'Updated'} successfully (mock)`);
    },
    onSuccess: () => {
      if (formMode === 'create') formEngine.reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const entities = ['users', 'orders', 'categories', 'products'];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted">Entity:</span>
        {entities.map((e) => (
          <button
            key={e}
            onClick={() => setActiveEntity(e)}
            className={`text-xs px-2 py-1 rounded ${
              activeEntity === e
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-bg-secondary text-text-muted'
            }`}
          >
            {e}
          </button>
        ))}
        <span className="text-xs text-text-muted ml-2">Mode:</span>
        <button
          onClick={() => setFormMode('create')}
          className={`text-xs px-2 py-1 rounded ${
            formMode === 'create'
              ? 'bg-success-100 text-success-700 font-medium'
              : 'bg-bg-secondary text-text-muted'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setFormMode('edit')}
          className={`text-xs px-2 py-1 rounded ${
            formMode === 'edit'
              ? 'bg-warning-100 text-warning-700 font-medium'
              : 'bg-bg-secondary text-text-muted'
          }`}
        >
          Edit
        </button>
      </div>

      {/* Form engine info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Form State</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">isDirty:</span>
              <span className={formEngine.isDirty ? 'text-warning-600' : 'text-text-primary'}>
                {String(formEngine.isDirty)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">isSubmitting:</span>
              <span>{String(formEngine.isSubmitting)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">isValid:</span>
              <span className={formEngine.isValid ? 'text-success-600' : 'text-error-600'}>
                {String(formEngine.isValid)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">fields count:</span>
              <span>{formEngine.fields.length}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Zod Schema Shape</p>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto max-h-32">
            {JSON.stringify(Object.keys(formEngine.zodSchema.shape), null, 2)}
          </pre>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Last Submitted</p>
          {lastSubmitted ? (
            <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto max-h-32">
              {JSON.stringify(lastSubmitted, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-text-muted">No data submitted yet.</p>
          )}
        </div>
      </div>

      {/* The actual form rendered by DynamicForm using formEngine fields */}
      <div className="border border-border rounded-lg p-4">
        <DynamicForm
          schema={schema}
          mode={formMode}
          defaultValues={formMode === 'edit' ? mockEditData[activeEntity] : undefined}
          onSubmit={async (data) => {
            await new Promise((r) => setTimeout(r, 500));
            setLastSubmitted(data);
            toast.success(`Form submitted (${formMode})`);
          }}
          layout="grid"
          submitText={formMode === 'create' ? 'Create Record' : 'Save Changes'}
        />
      </div>

      <p className="text-xs text-text-muted">
        💡 <code>useFormEngine</code> bridges metadata → Zod validation → React Hook Form → CRUD
        mutations. Form state stays in RHF, never in Zustand.
      </p>
    </div>
  );
}

// ─── 5. Optimistic Update Demo ───────────────────────────────

function OptimisticUpdateDemo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([
    { id: 1, name: 'Item A', status: 'active' },
    { id: 2, name: 'Item B', status: 'active' },
    { id: 3, name: 'Item C', status: 'inactive' },
  ]);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()} – ${msg}`]);
  }, []);

  const simulateOptimisticUpdate = useCallback(
    async (id: number, newName: string) => {
      // Step 1: Optimistic update (instant)
      const snapshot = [...items];
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: newName } : item)));
      addLog(`⚡ Optimistic: item ${id} → "${newName}"`);

      // Step 2: Simulate API call
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // 20% chance of failure for demo
            if (Math.random() < 0.2) reject(new Error('API Error'));
            else resolve(true);
          }, 1000);
        });
        addLog(`✅ Confirmed: item ${id} saved`);
        toast.success(`Item ${id} updated`);
      } catch {
        // Step 3: Rollback on error
        setItems(snapshot);
        addLog(`🔴 Rollback: item ${id} reverted`);
        toast.error(`Failed to update item ${id} – rolled back`);
      }
    },
    [items, addLog],
  );

  const simulateOptimisticDelete = useCallback(
    async (id: number) => {
      const snapshot = [...items];
      setItems((prev) => prev.filter((item) => item.id !== id));
      addLog(`⚡ Optimistic delete: item ${id}`);

      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.2) reject(new Error('API Error'));
            else resolve(true);
          }, 1000);
        });
        addLog(`✅ Confirmed: item ${id} deleted`);
        toast.success(`Item ${id} deleted`);
      } catch {
        setItems(snapshot);
        addLog(`🔴 Rollback: item ${id} restored`);
        toast.error(`Failed to delete item ${id} – rolled back`);
      }
    },
    [items, addLog],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Live Data</p>
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-xs text-text-muted">All items deleted.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-bg-secondary p-2 rounded-lg"
                >
                  <div className="text-xs">
                    <span className="font-mono text-text-muted">#{item.id}</span>{' '}
                    <span className="font-medium">{item.name}</span>{' '}
                    <span
                      className={item.status === 'active' ? 'text-success-600' : 'text-text-muted'}
                    >
                      ({item.status})
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => simulateOptimisticUpdate(item.id, `${item.name} (edited)`)}
                      className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700 hover:bg-primary-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => simulateOptimisticDelete(item.id)}
                      className="text-xs px-2 py-0.5 rounded bg-error-100 text-error-700 hover:bg-error-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <BaseButton
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => {
              setItems([
                { id: 1, name: 'Item A', status: 'active' },
                { id: 2, name: 'Item B', status: 'active' },
                { id: 3, name: 'Item C', status: 'inactive' },
              ]);
              setLog([]);
              toast.success('Data reset');
            }}
          >
            Reset Data
          </BaseButton>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Event Log</p>
          <div className="bg-bg-secondary p-3 rounded-lg space-y-1 min-h-[120px] max-h-[200px] overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-xs text-text-muted">
                Click Edit or Delete to see optimistic updates.
              </p>
            ) : (
              log.map((entry, i) => (
                <p key={i} className="text-xs font-mono">
                  {entry}
                </p>
              ))
            )}
          </div>
          <p className="text-xs text-text-muted mt-2">
            20% chance of failure – watch for rollback behaviour.
          </p>
        </div>
      </div>

      <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
        {`// Pattern used in useCrud (via optimisticHelpers):

onMutate: async (id, data) => {
  await queryClient.cancelQueries({ queryKey: baseKey });
  const snapshot = queryClient.getQueryData(listKey);
  queryClient.setQueryData(listKey, optimisticallyUpdated);
  return { snapshot };
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(listKey, context.snapshot); // rollback
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: baseKey }); // refetch truth
}`}
      </pre>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export function StateShowcasePage() {
  return (
    <div className="space-y-6">
      {/* Page intro */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2">
          Week 6 – State Production Showcase
        </h1>
        <p className="text-sm text-indigo-700 mb-3">
          Production-grade state management: React Query + Zustand + React Hook Form. Each layer has
          a dedicated role – no state leaks between layers.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
            ✓ React Query setup
          </span>
          <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
            ✓ Zustand store
          </span>
          <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
            ✓ Global metadata store
          </span>
          <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
            ✓ Form engine integration
          </span>
          <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
            ✓ Optimistic update
          </span>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4">
        <pre className="text-xs text-text-secondary overflow-x-auto">
          {`┌──────────────────────────────────────────────────────┐
│                  State Architecture                  │
├────────────────┬─────────────────────────────────────┤
│  Server State  │  React Query (TanStack Query v5)    │
│                │  - queryKeys factory (type-safe)     │
│                │  - staleTime: 30s, gcTime: 5min     │
│                │  - Optimistic updates (helpers)     │
│                │  - placeholderData for pagination   │
├────────────────┼─────────────────────────────────────┤
│  Client State  │  Zustand + devtools + immer         │
│                │  - UIStore (sidebar, theme, modals) │
│                │  - AuthStore (JWT, persist)          │
│                │  - TableStore (per-entity, immer)   │
│                │  - MetadataStore (schema cache)     │
├────────────────┼─────────────────────────────────────┤
│  Form State    │  React Hook Form + Zod              │
│                │  - useFormEngine (bridge hook)       │
│                │  - Auto Zod from EntitySchema        │
│                │  - Validate on blur, submit          │
├────────────────┼─────────────────────────────────────┤
│  URL State     │  React Router v6                    │
│                │  - :entity from URL drives all      │
└────────────────┴─────────────────────────────────────┘`}
        </pre>
      </div>

      {/* Sections */}
      <Section
        title="1. React Query – Production Setup"
        description="centralized QueryClient, query key factory, cache management"
      >
        <ReactQueryDemo />
      </Section>

      <Section
        title="2. Zustand Stores – devtools + immer"
        description="UI Store, Auth Store, Table Store with middleware"
      >
        <ZustandStoresDemo />
      </Section>

      <Section
        title="3. Global Metadata Store"
        description="Schema cache with staleness tracking, preload, invalidation"
      >
        <MetadataStoreDemo />
      </Section>

      <Section
        title="4. Form Engine Integration"
        description="useFormEngine: EntitySchema → Zod → RHF → Mutation bridge"
      >
        <FormEngineDemo />
      </Section>

      <Section
        title="5. Optimistic Updates"
        description="Snapshot → optimistic set → rollback on error → invalidate"
      >
        <OptimisticUpdateDemo />
      </Section>

      {/* Key files */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-bg-secondary px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Key Files</h3>
        </div>
        <div className="p-4">
          <ul className="text-xs space-y-1 ml-4 list-disc text-text-secondary">
            <li>
              <code>core/query/queryClient.ts</code> – Production QueryClient factory (staleTime,
              gcTime, retry)
            </li>
            <li>
              <code>core/query/queryKeys.ts</code> – Type-safe query key factory (crud, schema,
              relation, auth)
            </li>
            <li>
              <code>core/query/optimisticHelpers.ts</code> – Reusable optimistic
              update/delete/bulkDelete
            </li>
            <li>
              <code>stores/middleware.ts</code> – Zustand middleware helpers (withImmerDevtools)
            </li>
            <li>
              <code>stores/metadataStore.ts</code> – Global schema cache with stale checking
            </li>
            <li>
              <code>stores/uiStore.ts</code> – Enhanced with devtools action names
            </li>
            <li>
              <code>stores/tableStore.ts</code> – Enhanced with immer + devtools
            </li>
            <li>
              <code>hooks/useFormEngine.ts</code> – Bridge: EntitySchema → Zod → RHF → mutations
            </li>
            <li>
              <code>hooks/useCrud.ts</code> – Refactored to use queryKeys + optimisticHelpers
            </li>
            <li>
              <code>hooks/useEntitySchema.ts</code> – Now caches into MetadataStore
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

StateShowcasePage.displayName = 'StateShowcasePage';
