import type { Meta, StoryObj } from '@storybook/react';
import { BaseButton } from '..';

// ============================================================
// BaseButton Stories
// ============================================================
const meta: Meta<typeof BaseButton> = {
  title: 'Base/Feedback/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost', 'outline'],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'icon', 'icon-sm'],
      description: 'Button size',
    },
    loading: { control: 'boolean', description: 'Show loading spinner' },
    disabled: { control: 'boolean', description: 'Disable button' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseButton>;

export const Primary: Story = {
  args: { children: 'Primary Button', variant: 'primary', size: 'md' },
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};

export const Danger: Story = {
  args: { children: 'Delete', variant: 'danger' },
};

export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
};

export const Ghost: Story = {
  args: { children: 'Ghost', variant: 'ghost' },
};

export const Loading: Story = {
  args: { children: 'Saving...', loading: true },
};

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <BaseButton size="xs">XS</BaseButton>
      <BaseButton size="sm">SM</BaseButton>
      <BaseButton size="md">MD</BaseButton>
      <BaseButton size="lg">LG</BaseButton>
      <BaseButton size="icon">🔔</BaseButton>
      <BaseButton size="icon-sm">✕</BaseButton>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <BaseButton variant="primary">Primary</BaseButton>
      <BaseButton variant="secondary">Secondary</BaseButton>
      <BaseButton variant="danger">Danger</BaseButton>
      <BaseButton variant="outline">Outline</BaseButton>
      <BaseButton variant="ghost">Ghost</BaseButton>
    </div>
  ),
};
