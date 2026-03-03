import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Filter } from 'lucide-react';
import { apiClient } from '@/core/api/apiClient';
import { BaseTable, BaseFilterBar, Card } from '@/components/base';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/core/utils';
import type { PaginatedResult, ColumnConfig } from '@/types';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  changes: any;
  createdAt: string;
}

const COLUMNS: ColumnConfig[] = [
  { name: 'id',        label: 'ID',         type: 'text',     visible: true, sortable: true,  filterable: false, editable: false, required: false },
  { name: 'action',    label: 'Hành động',  type: 'text',     visible: true, sortable: true,  filterable: true,  editable: false, required: false },
  { name: 'entity',    label: 'Entity',     type: 'text',     visible: true, sortable: true,  filterable: true,  editable: false, required: false },
  { name: 'entityId',  label: 'Entity ID',  type: 'text',     visible: true, sortable: false, filterable: false, editable: false, required: false },
  { name: 'userId',    label: 'User',       type: 'text',     visible: true, sortable: true,  filterable: true,  editable: false, required: false },
  { name: 'createdAt', label: 'Thời gian',  type: 'datetime', visible: true, sortable: true,  filterable: false, editable: false, required: false },
];

const AuditPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useQuery<PaginatedResult<AuditLog>>({
    queryKey: ['audit', page, debouncedSearch],
    queryFn: () =>
      apiClient.get(`/audit?page=${page}&limit=25${debouncedSearch ? `&search=${debouncedSearch}` : ''}`),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-sm text-gray-500">Lịch sử thao tác trong hệ thống</p>
      </div>

      <BaseFilterBar
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => refetch()}
      />

      <BaseTable
        columns={COLUMNS}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={25}
        loading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AuditPage;
