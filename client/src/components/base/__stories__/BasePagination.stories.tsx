import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BasePagination } from '../BasePagination';

const meta: Meta<typeof BasePagination> = {
  title: 'Base/Data/BasePagination',
  component: BasePagination,
  tags: ['autodocs'],
  argTypes: {
    page: { control: 'number' },
    limit: { control: 'number' },
    total: { control: 'number' },
    compact: { control: 'boolean' },
    showSizeChanger: { control: 'boolean' },
    showTotal: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BasePagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    return (
      <BasePagination
        page={page}
        limit={limit}
        total={120}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    );
  },
};

export const FewPages: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <BasePagination
        page={page}
        limit={10}
        total={30}
        onPageChange={setPage}
        showSizeChanger={false}
      />
    );
  },
};

export const ManyPages: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    return (
      <BasePagination
        page={page}
        limit={limit}
        total={5000}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    );
  },
};

export const Compact: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <BasePagination
        page={page}
        limit={10}
        total={80}
        compact
        onPageChange={setPage}
        showSizeChanger={false}
      />
    );
  },
};

export const CustomPageSizes: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    return (
      <BasePagination
        page={page}
        limit={limit}
        total={200}
        pageSizeOptions={[25, 50, 100, 200]}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    );
  },
};
