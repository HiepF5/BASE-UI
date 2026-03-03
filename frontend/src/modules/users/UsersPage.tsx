import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Shield, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/core/api/apiClient';
import {
  Card, BaseButton, BaseModal, BaseTable, ConfirmDialog, Badge, BaseFilterBar,
} from '@/components/base';
import { useToggle, useDebounce } from '@/hooks';
import type { User, PaginatedResult, ColumnConfig } from '@/types';

const COLUMNS: ColumnConfig[] = [
  { name: 'id',       label: 'ID',        type: 'text', visible: true, sortable: true, filterable: false, editable: false, required: false },
  { name: 'username', label: 'Username',   type: 'text', visible: true, sortable: true, filterable: true,  editable: true,  required: true },
  { name: 'email',    label: 'Email',      type: 'email', visible: true, sortable: true, filterable: true, editable: true, required: false },
  { name: 'role',     label: 'Vai trò',    type: 'select', visible: true, sortable: true, filterable: true, editable: true, required: true, options: [
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ]},
];

const UsersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery<PaginatedResult<User>>({
    queryKey: ['users', page, debouncedSearch],
    queryFn: () => apiClient.get(`/users?page=${page}&limit=25${debouncedSearch ? `&search=${debouncedSearch}` : ''}`),
  });

  const createModal = useToggle();
  const deleteModal = useToggle();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', email: '', role: 'viewer', password: '' });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/users', data),
    onSuccess: () => { toast.success('Tạo user thành công'); qc.invalidateQueries({ queryKey: ['users'] }); createModal.setFalse(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => { toast.success('Đã xóa'); qc.invalidateQueries({ queryKey: ['users'] }); deleteModal.setFalse(); },
  });

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Quản lý người dùng hệ thống</p>
        </div>
        <BaseButton size="sm" onClick={() => { setEditUser(null); setForm({ username: '', email: '', role: 'viewer', password: '' }); createModal.setTrue(); }}>
          <Plus className="h-4 w-4" /> Thêm user
        </BaseButton>
      </div>

      <BaseFilterBar search={search} onSearchChange={setSearch} onRefresh={() => qc.invalidateQueries({ queryKey: ['users'] })} />

      <BaseTable
        columns={COLUMNS}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={25}
        loading={isLoading}
        onPageChange={setPage}
        onEdit={(row) => {
          setEditUser(row as User);
          setForm({ username: (row as User).username, email: (row as User).email ?? '', role: (row as User).role, password: '' });
          createModal.setTrue();
        }}
        onDelete={(row) => { setDeleteTarget(row as User); deleteModal.setTrue(); }}
      />

      <BaseModal open={createModal.value} onClose={createModal.setFalse} title={editUser ? 'Sửa User' : 'Tạo User'} size="md">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input className={inputClass} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Vai trò</label>
            <select className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password {editUser && '(để trống nếu không đổi)'}</label>
            <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} {...(!editUser && { required: true })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <BaseButton type="button" variant="secondary" onClick={createModal.setFalse}>Hủy</BaseButton>
            <BaseButton type="submit" loading={createMutation.isPending}>{editUser ? 'Cập nhật' : 'Tạo'}</BaseButton>
          </div>
        </form>
      </BaseModal>

      <ConfirmDialog
        open={deleteModal.value}
        onClose={deleteModal.setFalse}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Xóa user"
        message={`Xóa "${deleteTarget?.username}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default UsersPage;
