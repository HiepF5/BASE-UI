import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../core/api/apiClient';
import { useUIStore } from '../../stores/uiStore';

// ============================================================
// DashboardPage - Overview with stats
// ============================================================
export function DashboardPage() {
  const { activeConnection } = useUIStore();

  const { data: tables = [] } = useQuery<string[]>({
    queryKey: ['tables', activeConnection],
    queryFn: () => apiClient.get(`/schema/${activeConnection}/tables`),
    enabled: Boolean(activeConnection),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {!activeConnection ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-neutral-500 mb-4">
            No active database connection. Go to Connections to set up one.
          </p>
          <Link to="/connections" className="text-primary-600 hover:underline">
            → Manage Connections
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Tables" value={tables.length} icon="📋" />
            <StatCard title="Connection" value={activeConnection} icon="🔌" />
            <StatCard title="Status" value="Connected" icon="✅" />
          </div>

          {/* Table list */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Available Tables</h2>
            </div>
            <div className="divide-y">
              {tables.map((table) => (
                <Link
                  key={table}
                  to={`/crud/${activeConnection}/${table}`}
                  className="block px-6 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm font-medium">{table}</span>
                </Link>
              ))}
              {tables.length === 0 && (
                <div className="px-6 py-8 text-center text-neutral-400">No tables found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
