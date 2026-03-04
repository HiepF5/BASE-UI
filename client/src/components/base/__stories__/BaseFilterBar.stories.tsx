import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseFilterBar } from '../BaseFilterBar';
import type { ColumnConfig, FilterGroup } from '../../../types';

const columns: ColumnConfig[] = [
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
      { label: 'Editor', value: 'editor' },
    ],
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    visible: true,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
  },
];

const meta: Meta<typeof BaseFilterBar> = {
  title: 'Base/Data/BaseFilterBar',
  component: BaseFilterBar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof BaseFilterBar>;

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterGroup | null>(null);
    return (
      <div className="space-y-4">
        <BaseFilterBar
          columns={columns}
          onFilter={setFilter}
          onSearch={setSearch}
          searchValue={search}
        />
        <div className="p-3 bg-bg-secondary rounded-lg text-sm">
          <p>
            <strong>Search:</strong> {search || '(none)'}
          </p>
          <p>
            <strong>Filter:</strong> {filter ? JSON.stringify(filter, null, 2) : '(none)'}
          </p>
        </div>
      </div>
    );
  },
};
