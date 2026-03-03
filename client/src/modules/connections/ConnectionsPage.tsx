import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../core/api/apiClient';
import { useUIStore } from '../../stores/uiStore';
import { BaseButton, BaseModal } from '../../components/base';
import toast from 'react-hot-toast';
import type { ConnectionInfo } from '../../types';

// ============================================================
// ConnectionsPage - Manage database connections
// ============================================================
export function ConnectionsPage() {
  const queryClient = useQueryClient();
  const { setActiveConnection, activeConnection } = useUIStore();
  const [showForm, setShowForm] = useState(false);

  const { data: connections = [], isLoading } = useQuery<ConnectionInfo[]>({
    queryKey: ['connections'],
    queryFn: () => apiClient.get('/connections'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/connections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setShowForm(false);
      toast.success('Connection created');
    },
    onError: () => toast.error('Failed to create connection'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/connections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection deleted');
    },
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/connections/${id}/test`),
    onSuccess: () => toast.success('Connection OK!'),
    onError: () => toast.error('Connection failed'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name'),
      type: formData.get('type'),
      host: formData.get('host'),
      port: Number(formData.get('port')),
      database: formData.get('database'),
      username: formData.get('username'),
      password: formData.get('password'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Database Connections</h1>
        <BaseButton onClick={() => setShowForm(true)}>+ New Connection</BaseButton>
      </div>

      {/* Connection list */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-neutral-400">Loading...</div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center text-neutral-400">
            No connections yet. Create one to get started.
          </div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className={`bg-white rounded-lg border p-4 flex items-center justify-between ${
                activeConnection === conn.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{conn.name}</span>
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded">{conn.type}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      conn.status === 'connected' ? 'bg-green-500' : 'bg-neutral-300'
                    }`}
                  />
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  {conn.host}:{conn.port}/{conn.database}
                </p>
              </div>
              <div className="flex gap-2">
                <BaseButton size="sm" variant="outline" onClick={() => testMutation.mutate(conn.id)}>
                  Test
                </BaseButton>
                <BaseButton
                  size="sm"
                  variant={activeConnection === conn.id ? 'primary' : 'secondary'}
                  onClick={() => setActiveConnection(conn.id)}
                >
                  {activeConnection === conn.id ? 'Active' : 'Use'}
                </BaseButton>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(conn.id)}
                >
                  Delete
                </BaseButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New connection form */}
      <BaseModal open={showForm} onClose={() => setShowForm(false)} title="New Connection" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" required className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select name="type" className="w-full border rounded px-3 py-2 text-sm">
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="oracle">Oracle</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Host</label>
              <input name="host" defaultValue="localhost" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Port</label>
              <input name="port" type="number" defaultValue="5432" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Database</label>
            <input name="database" required className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input name="username" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input name="password" type="password" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <BaseButton type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </BaseButton>
            <BaseButton type="submit" loading={createMutation.isPending}>
              Create
            </BaseButton>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
