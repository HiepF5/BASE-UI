import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseDatePicker } from '..';

const meta: Meta<typeof BaseDatePicker> = {
  title: 'Base/Form/BaseDatePicker',
  component: BaseDatePicker,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    mode: { control: 'select', options: ['date', 'datetime-local', 'time'] },
    label: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseDatePicker>;

export const DateOnly: Story = {
  args: { label: 'Birth Date', mode: 'date' },
};

export const DateTime: Story = {
  args: { label: 'Appointment', mode: 'datetime-local' },
};

export const TimeOnly: Story = {
  args: { label: 'Meeting Time', mode: 'time' },
};

export const WithError: Story = {
  args: { label: 'Start Date', error: 'Date is required', mode: 'date' },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      <BaseDatePicker label="Small" size="sm" mode="date" />
      <BaseDatePicker label="Medium" size="md" mode="date" />
      <BaseDatePicker label="Large" size="lg" mode="date" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <BaseDatePicker
        label="Select Date"
        mode="date"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        hint={val ? `Selected: ${val}` : 'No date selected'}
      />
    );
  },
};
