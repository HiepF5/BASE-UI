import React, { useState } from 'react';
import { Plus, Plug, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import {
  Card, BaseButton, BaseModal, ConfirmDialog, Badge, EmptyState,
} from '@/components/base';
import { useToggle } from '@/hooks';
import type { ConnectionInfo } from '@/types';

/* ═══ ConnectionsPage ═══ */

const ConnectionsPage: React.FC = () => {
  const qc = useQueryClient();

  /* Fetch connections */
  const { data: connections, isLoading } = useQuery<ConnectionInfo[]>({
    queryKey: ['connections'],
    queryFn: () => apiClient.get('/connections'),
  });

  /* Create */
  const createModal = useToggle();
  const deleteModal = useToggle();
  const [deleteTarget, setDeleteTarget] = useState<ConnectionInfo | null>(null);
  const [form, setForm] = useState({
    name: '', type: 'postgres' as const, host: '', port: 5432,
    database: '', username: '', password: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiClient.post('/connections', data),
    onSuccess: () => {
      toast.success('Tạo connection thành công');
      qc.invalidateQueries({ queryKey: ['connections'] });
      createModal.setFalse();
    },
    onError: (e: any) => toast.error(e.message ?? 'Lỗi'),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/connections/${id}/test`),
    onSuccess: () => toast.success('Kết nối thành công!'),
    onError: () => toast.error('Kết nối thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/connections/${id}`),
    onSuccess: () => {
      toast.success('Đã xóa');
      qc.invalidateQueries({ queryKey: ['connections'] });
      deleteModal.setFalse();
    },
  });

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Connections</h2>
          <p className="text-sm text-gray-500">Quản lý kết nối database</p>
        </div>
        <BaseButton size="sm" onClick={createModal.setTrue}>
          <Plus className="h-4 w-4" /> Thêm connection
        </BaseButton>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border bg-gray-100" />
          ))}
        </div>
      ) : !connections?.length ? (
        <EmptyState
          icon={<Plug className="h-12 w-12" />}
          title="Chưa có connection nào"
          description="Thêm connection để bắt đầu quản lý database"
          action={
            <BaseButton size="sm" onClick={createModal.setTrue}>
              <Plus className="h-4 w-4" /> Thêm connection
            </BaseButton>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {connections.map((conn) => (
            <Card key={conn.id} className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{conn.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {conn.type} • {conn.host}:{conn.port}/{conn.database}
                  </p>
                </div>
                <Badge variant={conn.status === 'connected' ? 'success' : conn.status === 'error' ? 'danger' : 'default'}>
                  {conn.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {conn.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                  {conn.status}
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <BaseButton
                  variant="outline"
                  size="xs"
                  onClick={() => testMutation.mutate(conn.id)}
                  loading={testMutation.isPending}
                >
                  Test
                </BaseButton>
                <BaseButton
                  variant="ghost"
                  size="xs"
                  className="text-danger-500"
                  onClick={() => { setDeleteTarget(conn); deleteModal.setTrue(); }}
                >
                  <Trash2 className="h-3 w-3" /> Xóa
                </BaseButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <BaseModal open={createModal.value} onClose={createModal.setFalse} title="Thêm Connection" size="md">
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tên</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Loại DB</label>
              <select className={inputClass} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}>
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="oracle">Oracle</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Port</label>
              <input type="number" className={inputClass} value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: +e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Host</label>
            <input className={inputClass} value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Database</label>
            <input className={inputClass} value={form.database} onChange={(e) => setForm((f) => ({ ...f, database: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input className={inputClass} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <BaseButton type="button" variant="secondary" onClick={createModal.setFalse}>Hủy</BaseButton>
            <BaseButton type="submit" loading={createMutation.isPending}>Tạo</BaseButton>
          </div>
        </form>
      </BaseModal>

      <ConfirmDialog
        open={deleteModal.value}
        onClose={deleteModal.setFalse}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Xóa connection"
        message={`Xóa "${deleteTarget?.name}"? Thao tác không thể hoàn tác.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ConnectionsPage;
