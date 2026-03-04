import type { Meta, StoryObj } from '@storybook/react';
import { BaseSpinner, PageLoader } from '..';

const meta: Meta<typeof BaseSpinner> = {
  title: 'Base/Feedback/BaseSpinner',
  component: BaseSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    color: { control: 'select', options: ['primary', 'white', 'muted', 'current'] },
    label: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseSpinner>;

export const Default: Story = {
  args: { size: 'md', color: 'primary' },
};

export const WithLabel: Story = {
  args: { size: 'md', label: 'Loading data...' },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <BaseSpinner size="xs" />
      <BaseSpinner size="sm" />
      <BaseSpinner size="md" />
      <BaseSpinner size="lg" />
      <BaseSpinner size="xl" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <BaseSpinner color="primary" />
      <BaseSpinner color="muted" />
      <div className="bg-primary p-3 rounded">
        <BaseSpinner color="white" />
      </div>
    </div>
  ),
};

export const FullPageLoader: Story = {
  render: () => (
    <div className="relative h-64 border border-border rounded">
      <PageLoader label="Loading page..." />
    </div>
  ),
};
