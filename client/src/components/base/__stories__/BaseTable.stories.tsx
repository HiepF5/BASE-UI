import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseTable } from '..';
import type { ColumnConfig, SortOption } from '../../../types';

const columns: ColumnConfig[] = [
  {
    name: 'id',
    label: 'ID',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: false,
    editable: false,
    required: false,
    width: 60,
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    visible: true,
    sortable: false,
    filterable: true,
    editable: true,
    required: true,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  },
  {
    name: 'active',
    label: 'Active',
    type: 'boolean',
    visible: true,
    sortable: false,
    filterable: true,
    editable: true,
    required: false,
  },
  {
    name: 'createdAt',
    label: 'Created',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: false,
    editable: false,
    required: false,
  },
];

const mockData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : 'user',
  active: i % 4 !== 0,
  createdAt: new Date(2025, 0, i + 1).toISOString(),
}));

const meta: Meta<typeof BaseTable> = {
  title: 'Base/Data/BaseTable',
  component: BaseTable,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof BaseTable>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const paged = mockData.slice((page - 1) * limit, page * limit);
    return (
      <BaseTable
        columns={columns}
        data={paged}
        total={mockData.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l: number) => {
          setLimit(l);
          setPage(1);
        }}
      />
    );
  },
};

export const WithSort: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortOption[]>([{ field: 'name', direction: 'asc' }]);
    return (
      <BaseTable
        columns={columns}
        data={mockData.slice(0, 10)}
        total={mockData.length}
        page={page}
        limit={10}
        sort={sort}
        onPageChange={setPage}
        onLimitChange={() => {}}
        onSort={setSort}
      />
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div>
        <p className="text-sm text-text-muted mb-2">Selected: {selected.length} rows</p>
        <BaseTable
          columns={columns}
          data={mockData.slice(0, 10)}
          total={mockData.length}
          page={page}
          limit={10}
          selectedRows={selected}
          onPageChange={setPage}
          onLimitChange={() => {}}
          onRowSelect={setSelected}
        />
      </div>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <BaseTable
        columns={columns}
        data={mockData.slice(0, 5)}
        total={mockData.length}
        page={page}
        limit={5}
        onPageChange={setPage}
        onLimitChange={() => {}}
        onEdit={(row: Record<string, unknown>) => alert(`Edit: ${row.name}`)}
        onDelete={(row: Record<string, unknown>) => alert(`Delete: ${row.name}`)}
      />
    );
  },
};

export const Striped: Story = {
  render: () => (
    <BaseTable
      columns={columns}
      data={mockData.slice(0, 10)}
      total={10}
      page={1}
      limit={10}
      striped
      onPageChange={() => {}}
      onLimitChange={() => {}}
    />
  ),
};

export const Compact: Story = {
  render: () => (
    <BaseTable
      columns={columns}
      data={mockData.slice(0, 10)}
      total={10}
      page={1}
      limit={10}
      compact
      onPageChange={() => {}}
      onLimitChange={() => {}}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <BaseTable
      columns={columns}
      data={[]}
      total={0}
      page={1}
      limit={10}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      emptyContent={
        <div className="py-4">
          <div className="text-2xl mb-2">📭</div>
          <p className="text-text-muted">No records found</p>
        </div>
      }
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <BaseTable
      columns={columns}
      data={[]}
      total={0}
      page={1}
      limit={10}
      loading
      onPageChange={() => {}}
      onLimitChange={() => {}}
    />
  ),
};
