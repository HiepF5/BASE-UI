import type { Meta, StoryObj } from '@storybook/react';
import { BaseForm } from '../BaseForm';
import type { ColumnConfig } from '../../../types';

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
  },
  {
    name: 'name',
    label: 'Full Name',
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
    validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$', message: 'Invalid email' },
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
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    visible: true,
    sortable: false,
    filterable: false,
    editable: true,
    required: false,
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
];

const meta: Meta<typeof BaseForm> = {
  title: 'Base/Data/BaseForm',
  component: BaseForm,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof BaseForm>;

export const CreateMode: Story = {
  render: () => (
    <div className="max-w-lg">
      <BaseForm
        columns={columns}
        mode="create"
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
        onCancel={() => alert('Cancelled')}
      />
    </div>
  ),
};

export const EditMode: Story = {
  render: () => (
    <div className="max-w-lg">
      <BaseForm
        columns={columns}
        mode="edit"
        defaultValues={{
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          bio: 'Lorem ipsum dolor sit amet.',
          active: true,
        }}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
        onCancel={() => alert('Cancelled')}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="max-w-lg">
      <BaseForm columns={columns} mode="create" loading onSubmit={() => {}} />
    </div>
  ),
};
