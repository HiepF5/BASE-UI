import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseInput } from '..';

const meta: Meta<typeof BaseInput> = {
  title: 'Base/Form/BaseInput',
  component: BaseInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'error', 'success'] },
    label: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseInput>;

export const Default: Story = {
  args: { label: 'Username', placeholder: 'Enter username...', size: 'md' },
};

export const WithError: Story = {
  args: { label: 'Email', value: 'invalid', variant: 'error', error: 'Invalid email address' },
};

export const WithSuccess: Story = {
  args: { label: 'Email', value: 'valid@mail.com', variant: 'success', hint: 'Looks good!' },
};

export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: <span>🔍</span>,
    rightIcon: <span>✕</span>,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      <BaseInput label="Small" size="sm" placeholder="Small input" />
      <BaseInput label="Medium" size="md" placeholder="Medium input" />
      <BaseInput label="Large" size="lg" placeholder="Large input" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: 'Disabled', value: 'Cannot edit', disabled: true },
};

export const Interactive: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <BaseInput
        label="Interactive"
        placeholder="Type something..."
        value={val}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
        hint={val.length > 0 ? `${val.length} characters` : undefined}
      />
    );
  },
};
