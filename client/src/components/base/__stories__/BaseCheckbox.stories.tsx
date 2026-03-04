import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseCheckbox } from '..';

const meta: Meta<typeof BaseCheckbox> = {
  title: 'Base/Form/BaseCheckbox',
  component: BaseCheckbox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseCheckbox>;

export const Default: Story = {
  args: { label: 'Accept terms and conditions' },
};

export const WithDescription: Story = {
  args: {
    label: 'Email notifications',
    description: 'Receive updates about new features',
  },
};

export const WithError: Story = {
  args: { label: 'Required checkbox', error: 'You must accept the terms' },
};

export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      <BaseCheckbox label="Small" size="sm" />
      <BaseCheckbox label="Medium (default)" size="md" />
      <BaseCheckbox label="Large" size="lg" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <BaseCheckbox
        label={checked ? 'Checked ✓' : 'Unchecked'}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
};
