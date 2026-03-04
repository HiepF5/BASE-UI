import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseSwitch } from '..';

const meta: Meta<typeof BaseSwitch> = {
  title: 'Base/Form/BaseSwitch',
  component: BaseSwitch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    description: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseSwitch>;

export const Default: Story = {
  args: { label: 'Dark mode' },
};

export const WithDescription: Story = {
  args: { label: 'Notifications', description: 'Receive push notifications for updates' },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <BaseSwitch label="Small" size="sm" />
      <BaseSwitch label="Medium (default)" size="md" />
      <BaseSwitch label="Large" size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: 'Disabled switch', disabled: true },
};

export const Interactive: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <BaseSwitch
        label={on ? 'Feature ON' : 'Feature OFF'}
        checked={on}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOn(e.target.checked)}
        description={on ? 'Click to disable' : 'Click to enable'}
      />
    );
  },
};
